```
tar -a -c -f .\unixsee-monorepo-latest.zip `
  --exclude=node_modules `
  --exclude=.git `
  --exclude=.next `
  --exclude=dist `
  --exclude=build `
  --exclude=coverage `
  --exclude=.turbo `
  --exclude=.cache `
  .
```
