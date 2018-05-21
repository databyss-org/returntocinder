# Data API

Data abstraction API for reading and writing Databyss entities. Currently implemented on mongodb.

## authors

### list
Parameters: none
Returns: a list of available authors
```
[
  {
    "code": "DD",
    "lastName": "Derrida",
    "firstName": "Jacques"
  },
  ...
]
```

## entries

### get
Parameters: options object
```
{
  author: 'dd', // [optional] author code
  motifId: 'abyss', // [optional] motif id
  sourceId: 'BSi', // [optional] source id
}
```
Returns: array of entry documents
Throws: error if author and/or motif not found
