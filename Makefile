# API
build-api-image:
	docker build -t snu_api -f api/Dockerfile .
run-api:
	docker run -d -p 8080:8080 snu_api

# App
build-app-image:
	docker build -t snu_app -f app/Dockerfile .
run-app:
	docker run -d -p 8081:8080 snu_app

# Admin
build-admin-image:
	docker build -t snu_admin -f admin/Dockerfile .
run-admin:
	docker run -d -p 8082:8080 snu_admin

build:
	build-api-image
	build-app-image
	build-admin-image
run:
	run-api
	run-app
	run-admin
