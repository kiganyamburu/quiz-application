"""
Django REST Framework Serializers for Quiz Application.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quiz, Question, Choice, QuizAttempt, Answer, LeaderboardEntry


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "choice_text", "order"]


class ChoiceWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer that includes whether the choice is correct (for results)."""

    class Meta:
        model = Choice
        fields = ["id", "choice_text", "is_correct", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for questions during quiz taking (hides correct answers)."""

    choices = ChoiceSerializer(many=True, read_only=True)
    display_text = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "display_text",
            "question_type",
            "points",
            "order",
            "choices",
        ]

    def get_display_text(self, obj):
        return obj.get_display_text()


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer for questions with correct answers (for results)."""

    choices = ChoiceWithAnswerSerializer(many=True, read_only=True)
    display_text = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "display_text",
            "question_type",
            "points",
            "order",
            "correct_blank_answer",
            "explanation",
            "choices",
        ]

    def get_display_text(self, obj):
        return obj.get_display_text()


class QuizListSerializer(serializers.ModelSerializer):
    """Serializer for quiz list view."""

    question_count = serializers.ReadOnlyField()
    total_points = serializers.ReadOnlyField()
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "question_count",
            "total_points",
            "time_limit",
            "is_active",
            "created_by",
            "created_at",
        ]


class QuizDetailSerializer(serializers.ModelSerializer):
    """Serializer for quiz detail view with questions."""

    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.ReadOnlyField()
    total_points = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "question_count",
            "total_points",
            "time_limit",
            "is_active",
            "questions",
            "created_at",
        ]


class QuizCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new quiz."""

    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "time_limit", "is_active"]


class AnswerSubmitSerializer(serializers.Serializer):
    """Serializer for submitting an answer."""

    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)


class QuizSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a complete quiz."""

    guest_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    answers = AnswerSubmitSerializer(many=True)
    time_taken = serializers.IntegerField(min_value=0)


class AnswerResultSerializer(serializers.ModelSerializer):
    """Serializer for answer results."""

    question = QuestionWithAnswerSerializer(read_only=True)
    selected_choice = ChoiceWithAnswerSerializer(read_only=True)

    class Meta:
        model = Answer
        fields = ["question", "selected_choice", "text_answer", "is_correct"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for quiz attempt summary."""

    quiz = QuizListSerializer(read_only=True)
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz",
            "display_name",
            "score",
            "total_points",
            "percentage",
            "time_taken",
            "completed",
            "started_at",
            "completed_at",
        ]


class QuizAttemptDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed quiz attempt with answers."""

    quiz = QuizDetailSerializer(read_only=True)
    answers = AnswerResultSerializer(many=True, read_only=True)
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz",
            "display_name",
            "score",
            "total_points",
            "percentage",
            "time_taken",
            "completed",
            "started_at",
            "completed_at",
            "answers",
        ]


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries."""

    display_name = serializers.ReadOnlyField()
    rank = serializers.SerializerMethodField()

    class Meta:
        model = LeaderboardEntry
        fields = [
            "id",
            "display_name",
            "best_score",
            "best_percentage",
            "best_time",
            "attempts_count",
            "last_attempt_at",
            "rank",
        ]

    def get_rank(self, obj):
        # Rank is computed in the view
        return getattr(obj, "rank", None)


class GlobalLeaderboardSerializer(serializers.Serializer):
    """Serializer for global leaderboard across all quizzes."""

    display_name = serializers.CharField()
    total_score = serializers.IntegerField()
    quizzes_completed = serializers.IntegerField()
    average_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    rank = serializers.IntegerField()
