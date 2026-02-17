"""
Management command to seed the database with sample quiz data.
Usage: python manage.py seed_quizzes
"""

from django.core.management.base import BaseCommand
from quiz.models import Quiz, Question, Choice


class Command(BaseCommand):
    help = "Seeds the database with sample quiz data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding quiz data...")

        # Create Geography Quiz
        geography_quiz = Quiz.objects.create(
            title="World Geography Challenge",
            description="Test your knowledge of world geography with fill-in-the-blank and multiple choice questions!",
            time_limit=10,
            is_active=True,
        )

        # Geography - Fill in the blank questions
        q1 = Question.objects.create(
            quiz=geography_quiz,
            question_text="The capital of France is {{blank}}.",
            question_type="FILL_BLANK",
            points=2,
            correct_blank_answer="Paris|paris",
            case_sensitive=False,
            order=1,
            explanation="Paris has been the capital of France since the 10th century.",
        )

        q2 = Question.objects.create(
            quiz=geography_quiz,
            question_text="The longest river in the world is the {{blank}} River.",
            question_type="FILL_BLANK",
            points=2,
            correct_blank_answer="Nile|nile|Amazon|amazon",
            case_sensitive=False,
            order=2,
            explanation="The Nile and Amazon compete for the title depending on measurement methods.",
        )

        # Geography - Multiple choice questions
        q3 = Question.objects.create(
            quiz=geography_quiz,
            question_text="Which continent has the most countries?",
            question_type="MULTIPLE_CHOICE",
            points=1,
            order=3,
            explanation="Africa has 54 recognized countries, making it the continent with the most.",
        )
        Choice.objects.bulk_create(
            [
                Choice(question=q3, choice_text="Asia", is_correct=False, order=1),
                Choice(question=q3, choice_text="Africa", is_correct=True, order=2),
                Choice(question=q3, choice_text="Europe", is_correct=False, order=3),
                Choice(
                    question=q3, choice_text="South America", is_correct=False, order=4
                ),
            ]
        )

        q4 = Question.objects.create(
            quiz=geography_quiz,
            question_text="What is the smallest country in the world?",
            question_type="MULTIPLE_CHOICE",
            points=1,
            order=4,
            explanation="Vatican City is only about 0.44 square kilometers.",
        )
        Choice.objects.bulk_create(
            [
                Choice(question=q4, choice_text="Monaco", is_correct=False, order=1),
                Choice(
                    question=q4, choice_text="Vatican City", is_correct=True, order=2
                ),
                Choice(
                    question=q4, choice_text="San Marino", is_correct=False, order=3
                ),
                Choice(
                    question=q4, choice_text="Liechtenstein", is_correct=False, order=4
                ),
            ]
        )

        q5 = Question.objects.create(
            quiz=geography_quiz,
            question_text="Mt. Everest is located in the {{blank}} mountain range.",
            question_type="FILL_BLANK",
            points=2,
            correct_blank_answer="Himalayas|Himalaya|himalaya|himalayas",
            case_sensitive=False,
            order=5,
            explanation="The Himalayas contain many of the world's highest peaks.",
        )

        self.stdout.write(self.style.SUCCESS(f"Created quiz: {geography_quiz.title}"))

        # Create Programming Quiz
        programming_quiz = Quiz.objects.create(
            title="Programming Fundamentals",
            description="Test your programming knowledge across multiple languages and concepts!",
            time_limit=15,
            is_active=True,
        )

        q6 = Question.objects.create(
            quiz=programming_quiz,
            question_text="In Python, the keyword to define a function is {{blank}}.",
            question_type="FILL_BLANK",
            points=2,
            correct_blank_answer="def",
            case_sensitive=True,
            order=1,
            explanation='Python uses "def" followed by the function name and parentheses.',
        )

        q7 = Question.objects.create(
            quiz=programming_quiz,
            question_text="Which data structure uses LIFO (Last In, First Out)?",
            question_type="MULTIPLE_CHOICE",
            points=1,
            order=2,
            explanation="A stack operates on LIFO principle - the last element added is the first one removed.",
        )
        Choice.objects.bulk_create(
            [
                Choice(question=q7, choice_text="Queue", is_correct=False, order=1),
                Choice(question=q7, choice_text="Stack", is_correct=True, order=2),
                Choice(
                    question=q7, choice_text="Linked List", is_correct=False, order=3
                ),
                Choice(question=q7, choice_text="Tree", is_correct=False, order=4),
            ]
        )

        q8 = Question.objects.create(
            quiz=programming_quiz,
            question_text="What does HTML stand for?",
            question_type="MULTIPLE_CHOICE",
            points=1,
            order=3,
            explanation="HTML stands for HyperText Markup Language.",
        )
        Choice.objects.bulk_create(
            [
                Choice(
                    question=q8,
                    choice_text="Hyper Text Markup Language",
                    is_correct=True,
                    order=1,
                ),
                Choice(
                    question=q8,
                    choice_text="High Tech Modern Language",
                    is_correct=False,
                    order=2,
                ),
                Choice(
                    question=q8,
                    choice_text="Hyper Transfer Markup Language",
                    is_correct=False,
                    order=3,
                ),
                Choice(
                    question=q8,
                    choice_text="Home Tool Markup Language",
                    is_correct=False,
                    order=4,
                ),
            ]
        )

        q9 = Question.objects.create(
            quiz=programming_quiz,
            question_text="The time complexity of binary search is O({{blank}}).",
            question_type="FILL_BLANK",
            points=3,
            correct_blank_answer="log n|log(n)|logn",
            case_sensitive=False,
            order=4,
            explanation="Binary search divides the search space in half with each comparison.",
        )

        q10 = Question.objects.create(
            quiz=programming_quiz,
            question_text="Which of these is NOT a JavaScript framework?",
            question_type="MULTIPLE_CHOICE",
            points=1,
            order=5,
            explanation="Django is a Python web framework, not JavaScript.",
        )
        Choice.objects.bulk_create(
            [
                Choice(question=q10, choice_text="React", is_correct=False, order=1),
                Choice(question=q10, choice_text="Vue", is_correct=False, order=2),
                Choice(question=q10, choice_text="Angular", is_correct=False, order=3),
                Choice(question=q10, choice_text="Django", is_correct=True, order=4),
            ]
        )

        self.stdout.write(self.style.SUCCESS(f"Created quiz: {programming_quiz.title}"))

        # Create Science Quiz
        science_quiz = Quiz.objects.create(
            title="Science Trivia",
            description="From biology to physics - test your scientific knowledge!",
            time_limit=12,
            is_active=True,
        )

        q11 = Question.objects.create(
            quiz=science_quiz,
            question_text="Water is made up of hydrogen and {{blank}}.",
            question_type="FILL_BLANK",
            points=1,
            correct_blank_answer="oxygen|Oxygen",
            case_sensitive=False,
            order=1,
            explanation="Water (H2O) consists of two hydrogen atoms and one oxygen atom.",
        )

        q12 = Question.objects.create(
            quiz=science_quiz,
            question_text="What is the chemical symbol for gold?",
            question_type="MULTIPLE_CHOICE",
            points=2,
            order=2,
            explanation='Au comes from the Latin word "aurum" meaning gold.',
        )
        Choice.objects.bulk_create(
            [
                Choice(question=q12, choice_text="Go", is_correct=False, order=1),
                Choice(question=q12, choice_text="Gd", is_correct=False, order=2),
                Choice(question=q12, choice_text="Au", is_correct=True, order=3),
                Choice(question=q12, choice_text="Ag", is_correct=False, order=4),
            ]
        )

        q13 = Question.objects.create(
            quiz=science_quiz,
            question_text="The speed of light is approximately 300,000 {{blank}} per second.",
            question_type="FILL_BLANK",
            points=2,
            correct_blank_answer="kilometers|km|kilometres",
            case_sensitive=False,
            order=3,
            explanation="Light travels at about 299,792 kilometers per second in a vacuum.",
        )

        q14 = Question.objects.create(
            quiz=science_quiz,
            question_text="Which planet is known as the Red Planet?",
            question_type="MULTIPLE_CHOICE",
            points=1,
            order=4,
            explanation="Mars appears red due to iron oxide (rust) on its surface.",
        )
        Choice.objects.bulk_create(
            [
                Choice(question=q14, choice_text="Venus", is_correct=False, order=1),
                Choice(question=q14, choice_text="Mars", is_correct=True, order=2),
                Choice(question=q14, choice_text="Jupiter", is_correct=False, order=3),
                Choice(question=q14, choice_text="Mercury", is_correct=False, order=4),
            ]
        )

        q15 = Question.objects.create(
            quiz=science_quiz,
            question_text="The powerhouse of the cell is the {{blank}}.",
            question_type="FILL_BLANK",
            points=2,
            correct_blank_answer="mitochondria|mitochondrion",
            case_sensitive=False,
            order=5,
            explanation="Mitochondria generate most of the cell's ATP energy.",
        )

        self.stdout.write(self.style.SUCCESS(f"Created quiz: {science_quiz.title}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded all quiz data!"))
