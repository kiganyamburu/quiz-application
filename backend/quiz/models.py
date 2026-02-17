"""
Django ORM Models for Quiz Application

This module defines the database schema using Django's ORM for:
- Quiz: The main quiz container
- Question: Questions with fill-in-the-blank support
- Choice: Multiple choice options for questions
- QuizAttempt: Records of user quiz attempts with scoring
- Leaderboard: Aggregated scores for leaderboard display
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import re


class Quiz(models.Model):
    """
    Represents a quiz containing multiple questions.
    """

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_quizzes",
        null=True,
        blank=True,
    )
    time_limit = models.PositiveIntegerField(
        help_text="Time limit in minutes (0 for unlimited)", default=0
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Quizzes"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()

    @property
    def total_points(self):
        return sum(q.points for q in self.questions.all())


class Question(models.Model):
    """
    Represents a question in a quiz.

    Supports two types:
    - MULTIPLE_CHOICE: Standard multiple choice question
    - FILL_BLANK: Fill in the blank question where the blank is marked with {{blank}}

    For fill-in-the-blank questions:
    - Use {{blank}} in the question_text to indicate where the blank should appear
    - Store the correct answer in the correct_blank_answer field
    - Multiple acceptable answers can be separated by | (pipe character)

    Example: "The capital of France is {{blank}}." with correct_blank_answer = "Paris|paris"
    """

    QUESTION_TYPES = (
        ("MULTIPLE_CHOICE", "Multiple Choice"),
        ("FILL_BLANK", "Fill in the Blank"),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField(
        help_text="Use {{blank}} to indicate fill-in-the-blank position"
    )
    question_type = models.CharField(
        max_length=20, choices=QUESTION_TYPES, default="MULTIPLE_CHOICE"
    )
    points = models.PositiveIntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    correct_blank_answer = models.CharField(
        max_length=255,
        blank=True,
        help_text="For fill-in-blank: correct answer(s) separated by | for alternatives",
    )
    case_sensitive = models.BooleanField(
        default=False,
        help_text="For fill-in-blank: whether answer matching is case-sensitive",
    )
    order = models.PositiveIntegerField(default=0)
    explanation = models.TextField(
        blank=True, help_text="Explanation shown after answering"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}: {self.question_text[:50]}"

    def get_blank_positions(self):
        """Returns list of blank positions in the question text."""
        pattern = r"\{\{blank\}\}"
        return [(m.start(), m.end()) for m in re.finditer(pattern, self.question_text)]

    def check_blank_answer(self, user_answer):
        """
        Check if user's answer matches the correct blank answer.
        Returns True if correct, False otherwise.
        """
        if not self.correct_blank_answer:
            return False

        acceptable_answers = self.correct_blank_answer.split("|")
        user_answer_clean = user_answer.strip()

        for answer in acceptable_answers:
            answer_clean = answer.strip()
            if self.case_sensitive:
                if user_answer_clean == answer_clean:
                    return True
            else:
                if user_answer_clean.lower() == answer_clean.lower():
                    return True
        return False

    def get_display_text(self):
        """Returns question text with blanks replaced by underscores for display."""
        return re.sub(r"\{\{blank\}\}", "_____", self.question_text)


class Choice(models.Model):
    """
    Represents a choice for a multiple choice question.
    """

    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="choices"
    )
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.choice_text} ({'Correct' if self.is_correct else 'Incorrect'})"


class QuizAttempt(models.Model):
    """
    Records a user's attempt at a quiz, including their score.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
        null=True,
        blank=True,
    )
    guest_name = models.CharField(
        max_length=100, blank=True, help_text="Name for guest users (when user is null)"
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.PositiveIntegerField(default=0)
    total_points = models.PositiveIntegerField(default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    time_taken = models.PositiveIntegerField(
        help_text="Time taken in seconds", default=0
    )
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-completed_at", "-started_at"]

    def __str__(self):
        user_display = self.user.username if self.user else self.guest_name or "Guest"
        return f"{user_display} - {self.quiz.title}: {self.score}/{self.total_points}"

    @property
    def display_name(self):
        """Returns the display name for leaderboards."""
        if self.user:
            return self.user.username
        return self.guest_name or "Anonymous"

    def calculate_score(self):
        """Calculate and update the score based on answers."""
        total = 0
        earned = 0

        for answer in self.answers.all():
            total += answer.question.points
            if answer.is_correct:
                earned += answer.question.points

        self.total_points = total
        self.score = earned
        self.percentage = (earned / total * 100) if total > 0 else 0
        self.save()


class Answer(models.Model):
    """
    Records a user's answer to a specific question within an attempt.
    """

    attempt = models.ForeignKey(
        QuizAttempt, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(
        Choice,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="For multiple choice questions",
    )
    text_answer = models.CharField(
        max_length=500, blank=True, help_text="For fill-in-blank questions"
    )
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["attempt", "question"]

    def __str__(self):
        return f"Answer to {self.question} - {'Correct' if self.is_correct else 'Incorrect'}"

    def save(self, *args, **kwargs):
        """Auto-calculate if answer is correct on save."""
        if self.question.question_type == "MULTIPLE_CHOICE":
            self.is_correct = (
                self.selected_choice.is_correct if self.selected_choice else False
            )
        elif self.question.question_type == "FILL_BLANK":
            self.is_correct = self.question.check_blank_answer(self.text_answer)
        super().save(*args, **kwargs)


class LeaderboardEntry(models.Model):
    """
    Aggregated leaderboard entry for a user on a specific quiz.
    Stores best scores for quick leaderboard queries.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="leaderboard_entries",
        null=True,
        blank=True,
    )
    guest_name = models.CharField(max_length=100, blank=True)
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="leaderboard_entries"
    )
    best_score = models.PositiveIntegerField(default=0)
    best_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    best_time = models.PositiveIntegerField(
        help_text="Best completion time in seconds", default=0
    )
    attempts_count = models.PositiveIntegerField(default=0)
    last_attempt_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Leaderboard Entries"
        ordering = ["-best_percentage", "-best_score", "best_time"]
        unique_together = ["user", "quiz", "guest_name"]

    def __str__(self):
        user_display = self.user.username if self.user else self.guest_name or "Guest"
        return f"{user_display} - {self.quiz.title}: {self.best_percentage}%"

    @property
    def display_name(self):
        if self.user:
            return self.user.username
        return self.guest_name or "Anonymous"

    @classmethod
    def update_from_attempt(cls, attempt):
        """Update or create leaderboard entry from a quiz attempt."""
        entry, created = cls.objects.get_or_create(
            user=attempt.user,
            guest_name=attempt.guest_name if not attempt.user else "",
            quiz=attempt.quiz,
            defaults={
                "best_score": attempt.score,
                "best_percentage": attempt.percentage,
                "best_time": attempt.time_taken,
                "attempts_count": 1,
            },
        )

        if not created:
            entry.attempts_count += 1
            # Update if better score, or same score with better time
            if attempt.percentage > entry.best_percentage or (
                attempt.percentage == entry.best_percentage
                and attempt.time_taken < entry.best_time
            ):
                entry.best_score = attempt.score
                entry.best_percentage = attempt.percentage
                entry.best_time = attempt.time_taken
            entry.save()

        return entry
