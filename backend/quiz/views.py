"""
Django REST Framework Views for Quiz Application.
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Avg, Count, F
from django.utils import timezone

from .models import Quiz, Question, Choice, QuizAttempt, Answer, LeaderboardEntry
from .serializers import (
    QuizListSerializer,
    QuizDetailSerializer,
    QuizCreateSerializer,
    QuestionSerializer,
    QuestionWithAnswerSerializer,
    ChoiceSerializer,
    QuizSubmitSerializer,
    QuizAttemptSerializer,
    QuizAttemptDetailSerializer,
    LeaderboardSerializer,
    GlobalLeaderboardSerializer,
)


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Quiz CRUD operations and quiz submission.
    """

    queryset = Quiz.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "list":
            return QuizListSerializer
        elif self.action == "create":
            return QuizCreateSerializer
        return QuizDetailSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """
        Submit answers for a quiz and get results.

        Expected payload:
        {
            "guest_name": "John Doe",  // optional
            "time_taken": 120,  // seconds
            "answers": [
                {"question_id": 1, "choice_id": 3},  // for multiple choice
                {"question_id": 2, "text_answer": "Paris"}  // for fill-in-blank
            ]
        }
        """
        quiz = self.get_object()
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create quiz attempt
        attempt = QuizAttempt.objects.create(
            user=request.user if request.user.is_authenticated else None,
            guest_name=serializer.validated_data.get("guest_name", ""),
            quiz=quiz,
            time_taken=serializer.validated_data["time_taken"],
            total_points=quiz.total_points,
        )

        # Process answers
        answers_data = serializer.validated_data["answers"]
        score = 0

        for answer_data in answers_data:
            question = get_object_or_404(
                Question, id=answer_data["question_id"], quiz=quiz
            )

            answer = Answer(attempt=attempt, question=question)

            if question.question_type == "MULTIPLE_CHOICE" and answer_data.get(
                "choice_id"
            ):
                choice = get_object_or_404(
                    Choice, id=answer_data["choice_id"], question=question
                )
                answer.selected_choice = choice
            elif question.question_type == "FILL_BLANK":
                answer.text_answer = answer_data.get("text_answer", "")

            answer.save()  # This triggers the is_correct calculation

            if answer.is_correct:
                score += question.points

        # Update attempt with final score
        attempt.score = score
        attempt.percentage = (
            (score / quiz.total_points * 100) if quiz.total_points > 0 else 0
        )
        attempt.completed = True
        attempt.completed_at = timezone.now()
        attempt.save()

        # Return results
        result_serializer = QuizAttemptDetailSerializer(attempt)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def leaderboard(self, request, pk=None):
        """Get leaderboard for a specific quiz."""
        quiz = self.get_object()
        entries = LeaderboardEntry.objects.filter(quiz=quiz).order_by(
            "-best_percentage", "-best_score", "best_time"
        )[:50]

        # Add rank to each entry
        for idx, entry in enumerate(entries, start=1):
            entry.rank = idx

        serializer = LeaderboardSerializer(entries, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for Question CRUD operations."""

    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.all()
        quiz_id = self.request.query_params.get("quiz_id")
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        return queryset


class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing quiz attempts."""

    queryset = QuizAttempt.objects.filter(completed=True)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return QuizAttemptDetailSerializer
        return QuizAttemptSerializer

    def get_queryset(self):
        queryset = QuizAttempt.objects.filter(completed=True)
        if self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        return queryset


class GlobalLeaderboardView(APIView):
    """
    API view for global leaderboard across all quizzes.
    Aggregates scores from all quizzes for each user.
    """

    def get(self, request):
        # Aggregate leaderboard entries by user
        leaderboard_data = (
            LeaderboardEntry.objects.values("user__username", "guest_name", "user_id")
            .annotate(
                total_score=Sum("best_score"),
                quizzes_completed=Count("id"),
                average_percentage=Avg("best_percentage"),
            )
            .order_by("-total_score", "-average_percentage")[:100]
        )

        # Format response
        results = []
        for idx, entry in enumerate(leaderboard_data, start=1):
            display_name = entry["user__username"] or entry["guest_name"] or "Anonymous"
            results.append(
                {
                    "rank": idx,
                    "display_name": display_name,
                    "total_score": entry["total_score"] or 0,
                    "quizzes_completed": entry["quizzes_completed"],
                    "average_percentage": round(entry["average_percentage"] or 0, 2),
                }
            )

        return Response(results)


class UserStatsView(APIView):
    """
    API view for user statistics.
    """

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        attempts = QuizAttempt.objects.filter(user=request.user, completed=True)

        stats = {
            "total_attempts": attempts.count(),
            "total_score": attempts.aggregate(Sum("score"))["score__sum"] or 0,
            "average_percentage": attempts.aggregate(Avg("percentage"))[
                "percentage__avg"
            ]
            or 0,
            "quizzes_completed": attempts.values("quiz").distinct().count(),
            "recent_attempts": QuizAttemptSerializer(attempts[:5], many=True).data,
        }

        return Response(stats)
