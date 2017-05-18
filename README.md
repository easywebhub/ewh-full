# EWH web ver
# HOW TO START
```
# start gitea
cd /app/gitea
nohup ./gitea web &

# start gitea-wrapper
cd /app/gitea-wrapper
forever start index.js --gogsPassword=quantri --gogsUsername=quantri --cloudflareEmail=xxxx --cloudflareKey=xxx

# start inline-editor-backend
cd /app/inline-editor-backend
forever start index.js --inline-editor-backend

# start ms-site-builder
cd /app/ms-site-builder
forever start index.js --ms-site-builder


# ide url http://212.237.15.108:8002/ide/
```