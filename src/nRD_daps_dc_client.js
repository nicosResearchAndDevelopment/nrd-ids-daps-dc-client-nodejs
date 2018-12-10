/**
 * @author jlangkau, spetrac
 *
 * @version 0.1.8
 *
 * documentation under <https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs>
 *
 */

//REM: keep this runnin'... otherwise unsecure certificates (like this comming from daps-dc) are not allowed :-(
//REM: try it by making this line a comment...
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const
    path_            = "app.IDS.daps_dc_client",
    config           = require(`${__dirname}/config/nRD_daps_dc_client_config.js`),
    name             = config.name,
    idsuuid          = config.idsuuid
    //region node_modules
    ,
    fs               = require("fs"),
    request          = require(`request`),
    jsonwebtoken     = require("jsonwebtoken")
    //endregion node_modules
    ,
    enums            = {
        'TokenFormat':        {
            'JWT':      "JWT",          // Json Web Token
            'SWT':      "SWT",          // Simple Web Token
            'SAML_1_1': "SAML_1_1",     // Security Assertion Markup Language (SAML) 1.1
            'SAML_2_0': "SAML_2_0",     // Security Assertion Markup Language (SAML) 2.0
            'OTHER':    "OTHER",        // Other
            'UNKNOWN':  "UNKNOWN"       // Unknown
        },
        'jwt_decoding_type':  {
            'decode': "decode",
            'verify': "verify"
        },
        'jwt_sign_algorithm': {
            'RS256': "RS256"
        }
    }, // enums

    //region class DAPS_pem
    /**
     * @class DAPS_pem
     */
    DAPS_pem         = (function () {

        const
            private_properties = new WeakMap()
        ; // const

        /**
         *
         * @param {object} https
         * @param {string} host
         * @param {object} options
         * @returns {Promise<object>}
         * @private
         */
        function request_({https, options}) {

            return new Promise(function (resolve, reject) {

                try {
                    https.get(options, (get_response) => {
                        let body = "";
                        get_response['on']('data', (chunk) => {
                            body = `${body}${chunk}`;
                        });
                        get_response.on('end', function () {
                            resolve(body);
                        });
                    });
                } catch (exception) {
                    reject(exception);
                }
            }); // return new Promise
        } // request_

        class DAPS_pem {

            /**
             *
             * @constructs DAPS_pem
             * @param {object} https
             * @param {string} host
             * @param {object} options
             */
            constructor({https, host, options}) {
                private_properties.set(this, {
                    'https':   https,
                    'host':    host,
                    'options': options
                });
            }

            /**
             *
             * @name DAPS_pem#request
             * @param {object} https
             * @param {string} host
             * @param {object} options
             * @returns {Promise}
             * @static
             */
            static request({https, host, options}) {
                return request_({'https': https, 'host': host, 'options': options});
            }

            /**
             *
             * @name DAPS_pem#request
             * @param {object} https
             * @param {string} host
             * @param {object} options
             * @returns {Promise}
             */
            request({https, host, options}) {
                return request_(
                    {
                        'https':   (https || private_properties.get(this)['https']),
                        'host':    (host || private_properties.get(this)['host']),
                        'options': (options || private_properties.get(this)['options'])
                    }
                );
            } // request

        } // class DAPS_pem

        return /** class */ DAPS_pem;

    }(/** outer_args {} */))
    //endregion class DAPS_pem

    //region crt/key
    ,
    public_cert_path = `${__dirname}${config.public_cert_path}`,
    private_key_path = `${__dirname}${config.private_key_path}`,
    private_key      = fs.readFileSync(`${private_key_path}`),
    public_cert      = fs.readFileSync(`${public_cert_path}`),
    //endregion crt/key

    //region daps
    daps_scheme      = config.daps_scheme,
    daps_host        = config.daps_host,
    daps_port        = config.daps_port,
    daps_token_path  = config.daps_token_path,
    //
    daps_url         = `${daps_scheme}://${daps_host}:${daps_port}`,
    daps_token_url   = `${daps_url}${daps_token_path}`
    //endregion daps

; // const

let
    /*
     * jwt_decoding: play around
     *      jwt_decoding_type.verify :: needs daps-dc's public-key
     *      jwt_decoding_type.decode :: NOT so secure :-(
     * Remember: if you are using 'dummy', so its token will be expired
     *  and therefore cannot be verified and will give you an error!!!
     */
    //jwt_decoding = enums.jwt_decoding_type.verify, /** use with YOUR cert-stuff */
    jwt_decoding = enums.jwt_decoding_type.decode, /** use, if you are playing around with 'dummy' */
    jwt_client_payload,
    timestamp    = (new Date).valueOf(),
    now_sec      = Math.floor(timestamp / 1000)
; // let

/**
 * @typedef {object} JwtClientPayloadObject
 * @property {string} iss
 * @property {string} aud
 * @property {string} sub
 * @property {string} name
 * @property {number} exp
 */
/**
 *
 * @type {JwtClientPayloadObject}
 */
jwt_client_payload = {
    'iss':  idsuuid,
    'aud':  config.jsonwebtoken_audience,
    'sub':  `${idsuuid}/`,
    'name': name,
    "jti":  `${idsuuid}/${timestamp}/${Math.floor((Math.random() * Number['MAX_SAFE_INTEGER']) + 1)}`,
    'iat':  now_sec,
    //REM: you can play around with it's 'issued at'
    //'iat':  Math.floor(now_sec - 2000),
    'exp':  Math.floor((now_sec + (60 * 60))) /** will be fresh for one hour */
    //REM: you can play around with it's experation time
    //'exp':  Math.floor(now_sec + 5) /* will be fresh for five seconds */
    //'exp':  now_sec - 1 /** will be declined by DAPS, because it's already expired (one second in past */
}; // jwt_client_payload

jsonwebtoken.sign(
    jwt_client_payload,
    private_key,
    /** options */
    {
        'algorithm': enums.jwt_sign_algorithm[config.jsonwebtoken_sign_algorithm]
    },
    (err, /** encrypted jwt_client_payload */ token) => {

        let
            //REM: here you can do proxy tweaks by your own, if nessecary... so far we are looking for configuration...
            // otherwise: leave it 'undefined'!!!
            proxy   = (
                ((typeof config.use_proxy === 'boolean') && config.use_proxy)
                    ?
                    `${config.proxy_schema}://${config.proxy_user}:${config.proxy_password}@${config.proxy_host}:${config.proxy_port}`
                    :
                    undefined
            ),
            payload = {
                'method':       "POST",
                'url':          daps_token_url,
                'proxy':        proxy,
                'form':         {
                    'grant_type':            "client_credentials",
                    'client_assertion_type': "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                    'client_assertion':      "JWTC1",
                    'assertion':             token
                } // form
                ,
                'agentOptions': {
                    'key':  private_key,
                    'cert': public_cert
                }
            } // payload
        ; // let

        console.log(`${path_} : payload : ${JSON.stringify(payload['form'])}`);

        request(payload, (err, res, body) => {

            try {

                if (err) { //REM: error first

                    console.log(`${path_} : err : ${JSON.stringify(err)}`);
                    //throw new Error(err);

                } else {

                    const
                        payload = JSON.parse(body)
                    ;

                    let
                        decoded_token
                    ;

                    if (typeof payload['success'] === "boolean" && !payload['success']) {

                        console.log(`${path_} : payload : \n-----BEGIN PAYLOAD-----\n${JSON.stringify(payload, "", "\t")}\n-----END PAYLOAD-----`);

                    } else {

                        console.log(`${path_} : payload : token : \n-----BEGIN JSON TOKEN-----\n${JSON.stringify(payload.token)}\n-----END JSON TOKEN-----`);

                        switch (jwt_decoding) {

                            case enums.jwt_decoding_type.verify:
                                DAPS_pem.request({
                                    'https':   require("https"),
                                    'options': {
                                        'hostname': daps_host,
                                        'port':     daps_port,
                                        'path':     "/pem",
                                        'method':   "GET"
                                    }
                                }).then((publicPem) => {

                                    jsonwebtoken.verify(payload.token, publicPem, (err, decoded) => {
                                        if (err) {
                                            /**
                                             * REM: if you will make this call with 'dummy' you will get:
                                             *  > app.IDS.daps_dc_client : DAPS_pem.request : err : TokenExpiredError: jwt expired
                                             * ...on your console.
                                             * So, if you like to see content anyway please use
                                             *      jwt_decoding = enums.jwt_decoding_type.decode
                                             * ...and you will see the decoded but NOT verified content of token
                                             *  given by DAPS
                                             */
                                            throw new Error(err);
                                        } else {
                                            decoded_token = decoded;
                                            /**
                                             * REM: have look at 'exp' and 'iat': 'exp' is one second younger than 'iat'
                                             *  so this guy will never (ever) working against anoterh connector, because
                                             *  it will (hopefully) be rejected...
                                             */
                                            console.log(`${path_} : decoded token : jwt_decoding_type = 'verify' : token : \n-----BEGIN VERIFIED TOKEN-----\n${JSON.stringify(decoded_token, "", "\t")}\n-----END VERIFIED TOKEN-----`);
                                        } // if ()
                                    });

                                }).catch((err) => {
                                    console.log(`${path_} : DAPS_pem.request : err : ${err.message}`);
                                }); // DAPS_pem.request()
                                break; // enums.jwt_decoding_type.verify

                            case enums.jwt_decoding_type.decode:
                                decoded_token = jsonwebtoken.decode(payload.token);
                                console.log(`${path_} : decoded token : jwt_decoding_type = 'decode' : token : \n-----BEGIN DECODED TOKEN-----\n${JSON.stringify(decoded_token, "", "\t")}\n-----END DECODED TOKEN-----`);
                                break; // enums.jwt_decoding_type.decode

                            default:
                                console.log(`${path_} : decode : NONE`);
                                break; // default

                        } // switch (jwt_decoding)

                    } // if ()

                } // if (err)

            } catch (jex) {
                console.log(`${path_} : exception : jex : ${jex.message}`);
            } // try

        }); // request

    } // callback :: jsonwebtoken.sign(err, token)

); // jsonwebtoken.sign()

// nRD_daps_dc_client.js :: EOF