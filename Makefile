github:
	rm -rf docs
	cp -r dist/ docs
	git add -A
	git commit -m "update dev version"
	git push

live:
	aws s3 sync dist s3://pudding.cool/process/weighted-pivot-scatter-plot --delete
	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/process/weighted-pivot-scatter-plot*'