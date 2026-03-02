.PHONY: deploy format dev

deploy:
	npm run build
	cp dist/index.html dist/404.html
	npx gh-pages -d dist

dev:
	npm run dev

format:
	npx prettier --write .
