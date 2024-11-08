Clone first the remote repository
--> 

To setup python virtual environment on your local device
	--> got to backend directory ==> use "cd backend" command
	--> python -m virtualenv venv ==> creates virtual environment
	--> venv\Scripts\activate ==> to activate virtual environment

To install all required packages for backend
	--> pip install -r requirements.txt ==> this will install all the packages included in requirements.text

NOTE: if naa moy i-dag2 nga packages sa backend, please make sure naka activate ang virtual environment para ang mga packages ma include

To add the new added packages into "requirements.txt"
	--> pip freeze > requirements.txt

To create your own DB migrations
	--> python manage.py makemigrations ==> to stage the changes in models
	--> python manage.py migrate ==> to save the changes in models

IMPORTANT NOTE: 
	--> Used .env file each for backend and frontend for security purposes
	--> Flake8 (linter) and Black (Formatter) is added so beware of the coding structure
	--> PLEASE KO frontend devs kamo lang configure or add sa mga files for frontend part
