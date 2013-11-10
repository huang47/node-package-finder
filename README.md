# npm smart search

## Motivation
Nowadays, in node ecosystem it's not easy to find the packages we are looking for.
For example, when a noder comes to npmjs.org or google.com, how do they find the 
best promise library? `npm smart search` comes to help

## Methodology
Besides keywords / description, we also compare
1. number of dependents
1. author (github repo stars, github followers)
1. rates of related stackoverflow / quora discussions

### number of dependents
TODO

### author
searchHelper

### rates of related stackoverflow / quora discussions
TODO

## API

### search package
```javascript
/package/:package
```

which returns a list of objects which possess name and score

lazy load all other meta info?

### top10 package

```javascript
route /package/top/:package
```
get top 10 search results on top of 


## test results
```javascript
/package/:package/:author/ci
```

get travis-ci test results with following format
```
{
    success: <boolean>,
    time: <string of last build time>
}
```