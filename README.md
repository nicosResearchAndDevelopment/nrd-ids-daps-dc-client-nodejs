# nrd-ids-daps-dc-client-nodejs

##### A sample implentation of a DAPS (Dynamic Attributes Provision Service) done by node.js and presented by nicos Research & Development.

The single file source code can be found [here](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs/blob/master/src/nRD_daps_dc_client.js).

What it does (so far):
- it will show as simple as possible and how to
- bring up a request token, done by JWT ([jsonwebtoken (wiki, english))](https://en.wikipedia.org/wiki/JSON_Web_Token)
- sign it with your certificate, make a request to [daps-dc.nicos-ag.com](https://daps-dc.nicos-ag.com:8081/about), (please read Repository [nrd-ids-daps-dc](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc))
- gets your very, very special SecurityProfile (also as an JWT), done by some certification body...
- response can be decoded (see: jsonwebtoken.decode() ) or - much better ;-) - verified (see: jsonwebtoken.verify() ) by daps-ds's public certificate so you have to fetch also (see: Certificate.request(...)) .

But at first you have to

### install node.js

Hopefully you'll get it from [here](https://nodejs.org/en/)!

Test it like

```
node --version
```
>v10.1.0

You can go inside the easy way

```
node
>
```

...and than type global (inside node!)

```
>global
```
> Object [global] {
> ## a lot things are going here!
> }

Leave it CTRL+C (two times)


### bring up nRD_daps_dc_client

Make directory 'nRD_daps_dc_client'

```
mkdir nRD_daps_dc_client
```

and in your console go to

```
cd nRD_daps_dc_client
```

> itsme/nRD_daps_dc_client$:

```
mkdir cert
mkdir config
```

...and bring in 'nRD_daps_dc_client.js', config (repository/config/daps_dc_client_config.js) and YOUR connector certs in the correct place (./cert), as seen in this repository.


### install node packages

- ["jsonwebtoken", by 'npm'](https://www.npmjs.com/package/jsonwebtoken)
- ["request", by 'npm'](https://www.npmjs.com/package/request)

```
$ npm install jsonwebtoken
$ npm install request
```

IMPORTANT: if you like to make those packeges global

```
$ npm install jsonwebtoken -g
$ npm install request -g
```

...please read the books!


## modify your config file

Please edit

```
./config/daps_dc_client_config.js
```

...by following the TODOs, like bring up IDS-Identifier (idsid, IDS-Key) or tweak the pathes to your certificate.


## start the application

```
itsme/nRD_daps_dc_client$: node nRD_daps_dc_client.js
```

...and have fun with it's result.


## See also

### nrd-ids-daps-dc-client-soapui

(will be come soon)

### nrd-ids-daps-dc-client-postman

(will be come soon)


## Please follow

Not the badest idea is to follow by watching this repository. At second it will be also a good idea to follow [@LostIndDataSpace](https://twitter.com/LostInDataSpace). This DAPS-DC-client has it's own hashtag: #nRD_ids_daps_dc_client_nodejs.

---


