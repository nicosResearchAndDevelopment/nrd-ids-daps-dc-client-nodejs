module.exports = {

    /**
     * watch out for '@YOURCONFIG'. Those tags have to lifted to your use case!
     */

    /**
     * @context :: some json-ld fake
     */
    "@context": {},

    /** SHOW BEGIN */

    'name':    "dummy", //@YOURCONFIG: insert YOUR connectors "displayName"
    /**
     * 'url': this is your connectors URL, so, it's something like it's "homepage"...
     */
    'url':     "https://example.com/",
    /**
     * idsuuid
     *          It is very important to use this guy in a proper way: it has to be THE SAME
     *          as the identifier in your certificate (under 'subjectAltName')!!!
     * @YOURCONFIG: fill in YOUR connectors IDS-identifier, 'ids-uuid
     */
    // 'idsuuid': "", //@YOURCONFIG: insert YOUR uuid-id
    //'idsuuid': "cd05af72-f686-402b-aa26-1ca7bed1d720", //REM: it's dummy's uuid!
    'idsuuid': "C=DE,O=nicos,OU=rd,CN=cd05af72-f686-402b-aa26-1ca7bed1d720", //REM: it's dummy's uuid!

    ///** @DELETEBEFOREDEPLOY :: BEE */ 'idsuuid': "9438e4cb-1782-4cce-879f-953335d6b725", //REM: it's BEE's uuid!

    /** @YOURCONFIG:
     * public_cert_path :: bring up YOUR file and fill in YOUR's
     */
    'public_cert_path': "/cert/nicosdummy.cert", //@YOURCONFIG: use it with YOUR public (!!!) certificate
    ///** @DELETEBEFOREDEPLOY  :: BEE */ 'public_cert_path': "/cert/nicosbee.cert", //@YOURCONFIG: use it with YOUR public (!!!) certificate

    /** @YOURCONFIG:
     * private_key_path :: bring up YOUR file and fill in YOUR's
     */
    'private_key_path': "/cert/nicosdummy.key", // @YOURCONFIG: use it with YOUR private key
    ///** @DELETEBEFOREDEPLOY  :: BEE */ 'private_key_path': "/cert/nicosbee.key", // @YOURCONFIG: use it with YOUR private key

    /** SHOW END */

    /**
     * daps_* :: leave it as it is...
     */
    'daps_scheme':     "https",
    'daps_host':       "ids.nicos-ag.com",
    'daps_port':       3000,
    'daps_token_path': "/daps/token",
    'daps_pem_path':   "/daps/pem",
    'daps_jwks_path':  "/daps/.well-known/jwks.json", //REM: not implemented so far, watch out for next version...

    'jsonwebtoken_sign_algorithm': "RS256",
    'jsonwebtoken_audience':       "https://www.internationaldataspaces.org/",

    /** broker */
    'broker': {
        'sda-srv01': {
            'root': "https://sda-srv01.iai.uni-bonn.de",
            'port': 8443
        }
    }, // broker

    /**
     * proxy
     * ...if you need to use one
     */
    'use_proxy':      false, /** 'false' means, following attributes are NOT used!!! */
    'proxy_schema':   "http", /** OR 'https'?!? - watch out!!! */
    'proxy_host':     "", /** your proxy host */
    'proxy_port':     42, /** ...and corresponding port you have to use */
    'proxy_user':     "put in your favourite user (name)",
    'proxy_password': "put in the right one!!! You're shure?!? ;-)"

}; // module.exports
