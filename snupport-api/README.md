# API SNUpport

## Lifecycle configuration des buckets `files_staging` et `files_prod`

```xml
<LifecycleConfiguration>
  <Rule>
     <ID>Expiration rule</ID>
     <Prefix>temp/</Prefix>
     <Status>Enabled</Status>
     <Expiration>
        <Days>1</Days>
     </Expiration>
  </Rule>
</LifecycleConfiguration>
```

Upload a lifecycle policy for the bucket

`s3cmd setlifecycle FILE s3://BUCKET`

Get a lifecycle policy for the bucket

`s3cmd getlifecycle s3://BUCKET`

Remove a lifecycle policy for the bucket

`s3cmd dellifecycle s3://BUCKET`
