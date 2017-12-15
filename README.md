# naf common service
multi-tenancy applicaiton platform

## api test

### for global tenancy
curl -v -d "tagname=tag1" -H "Accept: application/json" http://localhost:7001/tag/create
curl -v -d "name=seq1" -H "Accept: application/json" http://localhost:7001/seq/nextval
### for test tenancy
curl -v -d "tagname=tag1" -H "Accept: application/json" -H "x-tenant: test" http://localhost:7001/tag/create
curl -v -d "name=seq1" -H "Accept: application/json" -H "x-tenant: test" http://localhost:7001/seq/nextval

### for test user
curl -v -d "name=admin&userid=admin&mobile=13500000000" -H "Accept: application/json" -H "x-tenant: test" http://localhost:7001/user/create
curl -v -d "userid=admin&newpass=123456" -H "Accept: application/json" -H "x-tenant: test" http://localhost:7001/user/passwd