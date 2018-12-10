module.exports = {

    /**
     * @context :: some JSON-LD fake
     */
    "@context": {},

    /** SHOW BEGIN */

    'name': "dummy", //TODO: insert YOUR connectors "displayName"

    /**
     * idsuuid
     *          It is very important to use this guy in a proper way: it has to be THE SAME
     *          as the identifier in your certificate (under 'subjectAltName')!!!
     * TODO: fill in YOUR connectors IDS-identifier, 'ids-uuid
     */
    //'idsuuid': "", //TODO: insert YOUR uuid-id
    'idsuuid': "cd05af72-f686-402b-aa26-1ca7bed1d720", //REM: it's dummy's uuid!

    /** TODO:
     * public_cert_path :: bring up YOUR file and fill in YOUR's
     */
    'public_cert_path': "/cert/nicosdummy.cert", //TODO: use it with YOUR public (!!!) certificate

    /** TODO:
     * private_key_path :: bring up YOUR file and fill in YOUR's
     */
    'private_key_path': "/cert/nicosdummy.key", // TODO: use it with YOUR private key

    /** SHOW END */

    /**
     * daps_* :: leave it as it is...
     */
    'daps_scheme':     "https",
    'daps_host':       "daps-dc.nicos-ag.com",
    'daps_port':       8081,
    'daps_token_path': "/token",
    'daps_pem_path':   "/pem",
    'daps_jwks_path':  "/.well-known/jwks.json", //REM: not implemented so far, next version...

    'jsonwebtoken_sign_algorithm': "RS256",
    'jsonwebtoken_audience':       "https://www.internationaldataspaces.org/",

    /**
     * proxy
     * ...if you need to use one
     */
    'use_proxy':      false,    /** 'false' means, following attributes are NOT used!!! */
    'proxy_schema':   "http",   /** OR 'https'?!? - watch out!!! */
    'proxy_host':     "",       /** your proxy host */
    'proxy_port':     42,       /** ...and corresponding port you have to use */
    'proxy_user':     "put in your favourite user (name)",
    'proxy_password': "put in the right one!!! You're shure?!? ;-)"

}; // module.exports
