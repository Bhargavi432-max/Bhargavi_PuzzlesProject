from django.db import models

class CustomUser(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=150)
    mobile_number = models.CharField(max_length=20)
    login_status = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    admin_name = models.CharField(max_length=100)
    admin_password = models.CharField(max_length=100)
    admin_email = models.EmailField(unique=True)
    login_status = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.admin_name
    
class DataTable(models.Model):
    id = models.AutoField(primary_key=True)
    admin_id = models.ForeignKey(Admin, on_delete=models.CASCADE)
    task_id = models.IntegerField()
    puzzle_id = models.CharField(max_length=50)
    puzzle_name = models.CharField(max_length=255)
    puzzle_video = models.FileField(upload_to='puzzle_frontend/src/videos')
    puzzle_question = models.TextField()
    puzzle_interview_code = models.CharField(max_length=100)
    level = models.CharField(max_length=50)
    puzzle_price = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.puzzle_name

class UserProfile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    user_in_task = models.IntegerField()
    user_in_puzzle = models.IntegerField()
    question_status = models.BooleanField(default=False)
    video_status = models.BooleanField(default=False)
    wallet = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User {self.user_id}"

class Subscription(models.Model):
    sub_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    sub_plan_type = models.CharField(max_length=100)
    sub_amount = models.DecimalField(max_digits=10, decimal_places=2)
    sub_renewal = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Subscription {self.sub_id} for {self.user.user_id}"
    
class LogReport(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    task_no = models.IntegerField()
    puzzle_no = models.IntegerField()
    question_view_status = models.BooleanField(default=False)
    video_view_status = models.BooleanField(default=False)
    puzzle_status = models.BooleanField(default=False)
    task_status = models.BooleanField(default=False)
    price_spend = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report {self.id} for User {self.user.user_id}"
    
class Plan(models.Model):
    id = models.AutoField(primary_key=True)
    plan_type = models.CharField(max_length=100)
    plan_price = models.DecimalField(max_digits=10, decimal_places=2)
    benefits = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.plan_type
    
class UserDataTableStatus(models.Model):
    STATUS_CHOICES = (
        ('notstarted', 'notstarted'),
        ('incompleted', 'Incompleted'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    data_table = models.ForeignKey(DataTable, on_delete=models.CASCADE)
    puzzle_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='notstarted')
    task_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='notstarted')
    puzzle_locked = models.BooleanField(default=False)
    time_spent = models.DurationField(null=True, blank=True)   


    class Meta:
        unique_together = ['user', 'data_table']

class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question