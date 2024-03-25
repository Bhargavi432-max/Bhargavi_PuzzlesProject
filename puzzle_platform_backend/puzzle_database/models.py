from django.db import models


# Model for storing user information
class CustomUser(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=150)
    mobile_number = models.CharField(max_length=20)
    login_status = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True)
    profile_image = models.ImageField(upload_to='puzzle_frontend/src/profile_image', null=True, blank=True)
    education = models.CharField(max_length=100, null=True, blank=True)
    college_name = models.CharField(max_length=150, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

# Model for storing admin information
class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    admin_name = models.CharField(max_length=100)
    admin_password = models.CharField(max_length=100)
    admin_email = models.EmailField(unique=True)
    login_status = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.admin_name
    

# Model for storing puzzle data information
class DataTable(models.Model):
    id = models.AutoField(primary_key=True)
    admin_id = models.ForeignKey(Admin, on_delete=models.CASCADE)
    task_id = models.IntegerField()
    puzzle_id = models.CharField(max_length=50)
    puzzle_name = models.CharField(max_length=255)
    puzzle_video = models.FileField(upload_to='puzzle_frontend/src/videos')
    puzzle_question = models.TextField()
    puzzle_code = models.TextField()
    puzzle_interview_code = models.CharField(max_length=100)
    level = models.CharField(max_length=50)
    puzzle_price = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.puzzle_id
    
# Model for storing user profile information
class UserProfile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    user_in_task = models.IntegerField(blank=True,null=True)
    user_in_puzzle = models.CharField(max_length=50,blank=True,null=True)
    question_status = models.BooleanField(default=False)
    video_status = models.BooleanField(default=False)
    wallet = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User {self.user.username}"
    
# Model for various Subscription plans information
class PlanTable(models.Model):
    id = models.AutoField(primary_key=True)
    plan_type = models.CharField(max_length=100)
    plan_price = models.DecimalField(max_digits=10, decimal_places=2)
    benefits = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.plan_type

# Model for storing user subscription information
class Subscription(models.Model):
    sub_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan_data = models.ForeignKey(PlanTable,on_delete=models.CASCADE)
    sub_renewal = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Subscription {self.user.username} for {self.plan_data.plan_type}"

# Model for storing log reports
class LogReport(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    task_id = models.IntegerField(blank=True, null=True)
    puzzle_id = models.CharField(max_length=50, blank=True, null=True)
    question_view_status = models.BooleanField(blank=True, null=True)
    video_view_status = models.BooleanField(blank=True, null=True)
    puzzle_status = models.CharField(max_length=20,blank=True, null=True)
    task_status = models.CharField(max_length=20,blank=True, null=True)
    price_spend = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    action_item = models.TextField(blank=False) 
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report {self.user.username} for User {self.action_item}"
    
# Model for storing puzzle task status
class UserDataTableStatus(models.Model):
    STATUS_CHOICES = (
        ('notstarted', 'notstarted'),
        ('incompleted', 'incompleted'),
        ('completed', 'completed'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    data_table = models.ForeignKey(DataTable, on_delete=models.CASCADE)
    puzzle_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='notstarted')
    task_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='notstarted')
    puzzle_locked = models.BooleanField(default=False)
    puzzle_count = models.IntegerField(default=0) 
    video_count = models.IntegerField(default=0) 
    time_spent = models.IntegerField(default=0) 

    class Meta:
        unique_together = ['user', 'data_table']

    def __str__(self):
        return f"Report {self.user.username} for User {self.data_table.puzzle_id}"

# Model for storing frequently asked questions
class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question

# Model for storing feedback
class Feedback(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField()
    review = models.TextField()

    def __str__(self):
        return f"{self.user.username} given {self.rating} rating"