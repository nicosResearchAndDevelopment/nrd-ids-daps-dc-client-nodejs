# nrd-ids-daps-dc-client-nodejs

A sample implentation of a DAPS (Dynamic Attributes Provision Service).


The single file source code can be found [here](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs/blob/master/src/nRD_daps_dc_client.js).

What it does (so far): it will show as simple as possible, how to bring up a request token, done by JWT ([jsonwebtoken (wiki, english))](https://en.wikipedia.org/wiki/JSON_Web_Token), sign it with your certificate, make a request to [DAPS-DC](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc) and get your very, very special SecurityProfile (also as an JWT), done by some certification body...

But at first you have to

### install node.js

### install node packages

- ["jsonwebtoken", by 'npm'](https://www.npmjs.com/package/jsonwebtoken)
- ["request", by 'npm'](https://www.npmjs.com/package/request)

```
$ npm install jsonwebtoken
$ npm install request
```


### download 'nRD_daps_dc_client.js'

You will find this guy [here](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs/blob/master/src/nRD_daps_dc_client.js).


## here we go

```javascript

const
    answer = 42
;

console.log(`here wo go in some seconds: ${answer}`);

```

## Follow

Not the badest idea is to follow by watching its repository. At second it will be also a good idea to follow [@LostIndDataSpace](https://twitter.com/LostInDataSpace). This DAPS-DC-client has it's own hashtag: #nRD_ids_daps_dc_client_nodejs.

