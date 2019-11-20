/**
 * @author jlangkau, spetrac
 *
 * @version 0.1.9
 *
 * documentation under <https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs>
 *
 * console.log / console.warn: so even the color shows, if something went wrong... .-(
 */

module.exports = async ({
                            'config': config
                        }) => {

    return new Promise((resolveTop, rejectTop) => {

        //REM: for all of us, not so familiar with this node.js-thingy: here we go! This is the main and real
        // client stuff and it has a lot off code you maybe seen before in the version <= 0.1.8
        try {

            //REM: keep this runnin'... otherwise unsecure certificates (like this comming from daps-dc) are not allowed :-(
            //REM: try it by making this line a comment...
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

            const
                path_            = "app.IDS.daps_dc_client",
                //config           = require(`${__dirname}/config/nRD_daps_dc_client_config.js`),
                name             = config.name,
                idsuuid          = config.idsuuid
                //region required node_modules
                ,
                fs               = require("fs"),
                request          = require("request"),
                jsonwebtoken     = require("jsonwebtoken")
                //endregion required node_modules
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
                DAPS_pem         = (function ({}) {

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
                                    get_response.on('data', (chunk) => {
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

                }(/** outer_args {} */{}))
                //endregion class DAPS_pem

                //region crt/key
                ,
                public_cert_path = `${__dirname}${config.public_cert_path}`,
                private_key_path = `${__dirname}${config.private_key_path}`,
                private_key      = fs.readFileSync(`${private_key_path}`),
                public_cert      = fs.readFileSync(`${public_cert_path}`)
                //endregion crt/key

                //region daps
                ,
                daps_scheme      = config.daps_scheme,
                daps_host        = config.daps_host,
                daps_port        = config.daps_port,
                daps_token_path  = config.daps_token_path,
                daps_pem_path    = config.daps_pem_path,
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
                 * For those who want to dive deeper:
                 *  http://www.rfc-editor.org/rfc/rfc7519.txt
                 */
                //jwt_decoding = enums.jwt_decoding_type.verify, /** use with YOUR cert-stuff */
                jwt_decoding = enums.jwt_decoding_type.decode, /** use, if you are playing around with 'dummy' */
                jwt_client_payload,
                timestamp    = (new Date).valueOf(),
                now_sec      = Math.floor(timestamp / 1000),
                //
                resultTop    = {
                    'timestamp': undefined,
                    'message':   ""
                } // promise-result of top level, so better don't touch...
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
                //'@context': {
                //    "@base": {
                //        '@prefix': false,
                //        '@id':     "http://www.rfc-editor.org/rfc/rfc7519.txt",
                //        '@vocab':  ""
                //    },
                //    "ids":   "https://w3id.org/idsa/core/"
                //},
                'iss':      `${idsuuid}`,
                'aud':      config.jsonwebtoken_audience,
                'sub':      `${idsuuid}`,
                'name':     name,
                "jti":      `${config.url}jti/${idsuuid}/${timestamp}/${Math.floor((Math.random() * Number.MAX_SAFE_INTEGER) + 1)}`,
                'iat':      now_sec,
                //REM: you can play around with it's 'issued at'
                //'iat':  Math.floor(now_sec - 2000),
                'exp':      Math.floor((now_sec + (60 * 60))) /** will be fresh for one hour */
                //REM: you can play around with it's experation time
                //'exp':  Math.floor(now_sec + 5) /* will be fresh for five seconds */
                //'exp':  now_sec - 1 /** will be declined by DAPS, because it's already expired (one second in the past */
                ,
                'ids':      "requestSecurityProfile",
                'nbf': now_sec
            }; // jwt_client_payload

            console.log(`${new Date().toISOString()} : ${path_} : jwt_client_payload : ${JSON.stringify(jwt_client_payload, "", "\t")}`);

            // TODO: remove
            //let that = {
            //    "@context": {
            //        "@base": {
            //            "@prefix": false,
            //            "@id":     "http://www.rfc-editor.org/rfc/rfc7519.txt",
            //            "@vocab":  ""
            //        },
            //        "ids":   "https://w3id.org/idsa/core/"
            //    },
            //    "iss":      "cd05af72-f686-402b-aa26-1ca7bed1d720",
            //    "aud":      "https://www.internationaldataspaces.org/",
            //    "sub":      "cd05af72-f686-402b-aa26-1ca7bed1d720",
            //    "name":     "dummy",
            //    "jti":      "https://example.com/jti/cd05af72-f686-402b-aa26-1ca7bed1d720/1553248419304/2261786068005840",
            //    "iat":      1553248419,
            //    "exp":      1553252019
            //};

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
                                //'client_assertion':      "JWTC1",
                                'client_assertion':      token,
                                //'scope':                 "ids_connector"
                                'scope':                 "https://w3id.org/idsa/core/Connector"
                                //'assertion':             token
                            } // form
                            ,
                            'agentOptions': {
                                'key':  private_key,
                                'cert': public_cert
                            }
                        } // payload
                    ; // let
                    //console.log(`${new Date().toISOString()} : ${path_} : payload : ${JSON.stringify(payload, "", "\t")}`);

                    console.log(`${new Date().toISOString()} : ${path_} : payload.from : ${JSON.stringify(payload.form, "", "\t")}`);

                    request(payload, (err, res, body) => {

                        try {

                            if (err) { //REM: error first
                                console.log(`${path_} : request(payload): err : ${JSON.stringify(err)}`);
                                rejectTop(err);
                            } else {

                                const
                                    payload = JSON.parse(body)
                                ;
                                let
                                    decoded_token
                                ;

                                if (typeof payload.success === "boolean" && !payload.success) {

                                    console.log(`${new Date().toISOString()} : ${path_} : payload : \n-----BEGIN PAYLOAD-----\n${JSON.stringify(payload, "", "\t")}\n-----END PAYLOAD-----`);

                                } else {

                                    console.log(`${new Date().toISOString()} : ${path_} : payload : token : \n-----BEGIN JSON TOKEN-----\n${JSON.stringify(payload.token, "", "\t")}\n-----END JSON TOKEN-----`);

                                    switch (jwt_decoding) {

                                        case enums.jwt_decoding_type.verify:
                                            DAPS_pem.request({
                                                'https':   require("https"),
                                                'options': {
                                                    'hostname': daps_host,
                                                    'port':     daps_port,
                                                    'path':     daps_pem_path,
                                                    'method':   "GET"
                                                } // options
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
                                                        console.warn(`${new Date().toISOString()} : ${path_} : decoded token : jwt_decoding_type = 'verify' : : err : ${JSON.stringify(err, "", "\t")}`);
                                                        //throw new Error(err);
                                                        rejectTop(new Error(err));
                                                    } else {
                                                        decoded_token = decoded;
                                                        /**
                                                         * REM: have look at 'exp' and 'iat': 'exp' is one second younger than 'iat'
                                                         *  so this guy will never (ever) working against anoterh connector, because
                                                         *  it will (hopefully) be rejected...
                                                         */
                                                        console.log(`${new Date().toISOString()} : ${path_} : decoded token : jwt_decoding_type = 'verify' : token : \n-----BEGIN VERIFIED TOKEN-----\n${JSON.stringify(decoded_token, "", "\t")}\n-----END VERIFIED TOKEN-----\n\n`);
                                                        resultTop.message   = `resolved by <enums.jwt_decoding_type.verify::jsonwebtoken.verify>`;
                                                        resultTop.timestamp = (Date.now() / 1000);
                                                        resolveTop(resultTop);
                                                    } // if ()
                                                });

                                            }).catch((err) => {
                                                console.warn(`${new Date().toISOString()} : ${path_} : DAPS_pem.request : err : ${err.message}`);
                                                rejectTop(new Error(err));
                                            }); // DAPS_pem.request()
                                            break; // enums.jwt_decoding_type.verify

                                        case enums.jwt_decoding_type.decode:
                                            decoded_token = jsonwebtoken.decode(payload.token);
                                            console.log(`${new Date().toISOString()} : ${path_} : decoded token : jwt_decoding_type = 'decode' : token : \n-----BEGIN DECODED TOKEN-----\n${JSON.stringify(decoded_token, "", "\t")}\n-----END DECODED TOKEN-----\n\n`);

                                            resultTop.message   = `resolved by <jwt_decoding_type.decode>`;
                                            resultTop.timestamp = (Date.now() / 1000);
                                            resolveTop(resultTop);

                                            break; // enums.jwt_decoding_type.decode

                                        default:
                                            console.warn(`${new Date().toISOString()} : ${path_} : decode : NONE`);
                                            rejectTop(new Error(err));
                                            break; // default

                                    } // switch (jwt_decoding)

                                } // if ()

                            } // if (err)

                        } catch (jex) {
                            console.warn(`${new Date().toISOString()} : ${path_} : exception : jex : ${jex.message}`);
                            rejectTop(new Error(jex));
                        } // try

                    }); // request

                } // callback :: jsonwebtoken.sign(err, token)

            ); // jsonwebtoken.sign()

        } catch (jex) {
            rejectTop(jex);
        } // try
    }); // return Promise

};
