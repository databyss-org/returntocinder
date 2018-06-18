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
### list
Parameters: query object
```
{
  author: string, // [optional] author code
  motifId: string, // [optional] motif id
  sourceId: string, // [optional] source id
  groupBy: oneOf('source','motif','author') // [optional]
}
```
Returns:
* groupBy unset: array of entry documents or []
* groupBy set: dictionary of entry documents or {}; keys are group entity id

### add
Parameters: document object

## motifs
### get
Parameters: options object
```
{
  motifId: string // motif id
}
```
Returns: a motif document
Throws: error if motif with specified id is not found

## biblio
### get
Returns: bibliography document
