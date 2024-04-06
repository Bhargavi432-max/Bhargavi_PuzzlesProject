from django.http import JsonResponse
from django.conf import settings
import os
import json
from .models import UserDataTableStatus,Admin,CustomUser,DataTable

# View for reading data in the JSON file.
def read_json_file_view(request):
    try:
        # Construct file path
        file_path = os.path.join(settings.BASE_DIR, 'puzzle_data.json')
        
        # Get admin email
        admin_email = "admin@gmail.com"
        #hello
        # Get admin instance
        admin = Admin.objects.get(admin_email=admin_email)
        
        # Define path for extra puzzle videos
        video_extra_path ='puzzle_frontend/src/videos/'

        # Open JSON file and load data
        with open(file_path, 'r') as file:
            data = json.load(file)
        
        # Loop through each task and puzzle in the JSON data
        for task in data['tasks']:
            task_id = task['task_id']
            for puzzle in task['puzzles']:
                puzzle_id = puzzle['puzzle_id']
                puzzle_name = puzzle['name']
                puzzle_video = video_extra_path + puzzle['video_name']
                puzzle_question = puzzle['question']
                puzzle_code = puzzle['code']
                puzzle_interview_code = puzzle['interview_code']
                level = puzzle['Level']
                puzzle_price = puzzle['puzzle_price']

                # Create DataTable instance for each puzzle
                DataTable.objects.create(
                    admin_id=admin,
                    task_id=task_id,
                    puzzle_id=puzzle_id,
                    puzzle_name=puzzle_name,
                    puzzle_video=puzzle_video,
                    puzzle_question=puzzle_question,
                    puzzle_code=puzzle_code,
                    puzzle_interview_code=puzzle_interview_code,
                    level=level,
                    puzzle_price=puzzle_price
                )
        
        # Retrieve all puzzles from DataTable
        puzzles = DataTable.objects.all()

        # Retrieve all users
        users = CustomUser.objects.all()

        # Loop through each user and each puzzle to create UserDataTableStatus instances
        for user in users:
            for puzzle in puzzles:
                # Check if the user has already played this puzzle
                existing_status = UserDataTableStatus.objects.filter(user=user, data_table=puzzle).exists()
                if not existing_status:
                    # Create UserDataTableStatus instance with puzzle_status and task_status as 'notstarted'
                    UserDataTableStatus.objects.create(
                        user=user,
                        data_table=puzzle,
                        puzzle_status='notstarted',
                        task_status='notstarted'
                    )

        # Return success response with data
        return JsonResponse({'data': data}, status=200)
    
    except FileNotFoundError:
        # Handle file not found error
        return JsonResponse({'error': 'File not found'}, status=404)
    
    except json.JSONDecodeError as e:
        # Handle invalid JSON format error
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    
    except Exception as e:
        # Handle other exceptions
        return JsonResponse({'error': str(e)}, status=500)
