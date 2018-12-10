# nrd-ids-daps-dc-client-nodejs

### A sample implementation of a DAPS (Dynamic Attributes Provision
 Service) client done by node.js and presented by nicos Research & Development.

The single file source code can be
 found [here](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs/blob/master/src/nRD_daps_dc_client.js).

What it does (so far):
- it will show as simple as possible and how to
- bring up a request token, done by JWT ([jsonwebtoken (wiki, english))](https://en.wikipedia.org/wiki/JSON_Web_Token)
- sign it with your certificate, make a request to [daps-dc.nicos-ag.com](https://daps-dc.nicos-ag.com:8081/about), (please read Repository [nrd-ids-daps-dc](https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc))
- gets your very, very special SecurityProfile (also as an JWT), done by some certification body...
- response can be decoded (see: jsonwebtoken.decode() ) or - much better ;-) - verified (see: jsonwebtoken.verify() ) by daps-ds's public certificate so you have to fetch also (see: Certificate.request(...)) .

## What is different to the version shown before?

### 'pem' vs. TLS public key

Token given by DAPS is now verified by DAPS's public key, served by DAPS itself on route './pem'. So, the class 'Certifikate' went away... (the old version gets the public key from DAPS TLS-portion, now it's history!)

### 'dummy' is in the house

So, out of the box you are equipped with a special certifiate, the dummy.
This allows you to send requests without any additional tweaks - and you will get a response immediatly! Also the DAPS-token given in response will be DECODED, so you will see a user-friendly output in your console and it shows a littel piece of JSON, reflecting dummy's IDS-securityProfile!

BUT: it's expired!

You can check it out by verifing it - see inline docs of `nRD_daps_dc_client.js`.

---

But at first you have to

## Install node.js

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


## Bring up nRD_daps_dc_client

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

...and bring in 'nRD_daps_dc_client.js', its configuration ('repository/config/daps_dc_client_config.js') and YOUR connector certs in the correct place (./cert), as seen in this repository.


## Install node packages

- ["jsonwebtoken", by 'npm'](https://www.npmjs.com/package/jsonwebtoken)
- ["request", by 'npm'](https://www.npmjs.com/package/request)

```
$ npm install jsonwebtoken
$ npm install request
```

IMPORTANT: if you like to make those packages global

```
$ npm install jsonwebtoken -g
$ npm install request -g
```

...please read the books!


## Modify your config file

Please edit

```
./config/daps_dc_client_config.js
```

...by following the TODOs, like bringing up the IDS-universal unique identifier (idsuuid) or tweak the pathes to your certificates.

Maybe you have to tweak some proxy-stuff, so go to

```
'use_proxy':      false
```

...turn it on, and put in the right coordinates.

Maybe this is not enough freedom to come out, please look for (here: `nRD_daps_dc_client.js`)

```
proxy = ((config.use_proxy) ? `${config.proxy_schema}://${config.proxy_user}:${config.proxy_password}@${config.proxy_host}:${config.proxy_port}` : undefined)
```

...and fill in the `proxy`-thingy by your own!


## Start the application

```
itsme/nRD_daps_dc_client$: node nRD_daps_dc_client.js
```

...and have fun with it's result.


## Please follow

Not the badest idea is to follow by watching this repository. At second it will be also a good idea to follow [@LostIndDataSpace](https://twitter.com/LostInDataSpace). This DAPS-DC-client has it's own hashtag: #nRD_ids_daps_dc_client_nodejs.

---


