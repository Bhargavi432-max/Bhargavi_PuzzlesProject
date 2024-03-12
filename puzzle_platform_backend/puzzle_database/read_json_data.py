from django.http import JsonResponse
from django.conf import settings
import os
import json

# View for reading data in the json file.
def read_json_file_view(request):
    try:
        file_path = os.path.join(settings.BASE_DIR, 'puzzle_data.json')
        with open(file_path, 'r') as file:
            json_data = json.load(file)

        return JsonResponse({'data': json_data}, status=200)
    except FileNotFoundError:
        return JsonResponse({'error': 'File not found'}, status=404)
    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
