from django.contrib import admin
from .models import Quiz, Question, Choice, QuizAttempt, Answer, LeaderboardEntry


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4
    min_num = 2


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["title", "created_by", "question_count", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["title", "description"]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["question_text", "quiz", "question_type", "points", "order"]
    list_filter = ["question_type", "quiz"]
    search_fields = ["question_text"]
    inlines = [ChoiceInline]


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ["choice_text", "question", "is_correct", "order"]
    list_filter = ["is_correct"]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = [
        "display_name",
        "quiz",
        "score",
        "total_points",
        "percentage",
        "completed",
        "started_at",
    ]
    list_filter = ["completed", "quiz", "started_at"]
    search_fields = ["user__username", "guest_name"]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ["attempt", "question", "is_correct", "answered_at"]
    list_filter = ["is_correct"]


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = [
        "display_name",
        "quiz",
        "best_score",
        "best_percentage",
        "attempts_count",
    ]
    list_filter = ["quiz"]
    search_fields = ["user__username", "guest_name"]
