/**
 * @author jlangkau, spetrac
 *
 * @version 0.1.6
 *
 * documentation under <https://github.com/nicosResearchAndDevelopment/nrd-ids-daps-dc-client-nodejs>
 *
 */


//REM: keep this runnin'... otherwise unsecure certificates (like this comming from daps-dc) are not allowed :-(
//REM: try it by making this line a comment...
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const

    path_           = "app.IDS.daps_dc_client",

    config          = require(`${__dirname}/config/nRD_daps_dc_client_config.js`),
    name            = config.name,
    idsid           = config.idsid,

    //region node_modules
    fs              = require("fs"),
    request         = require(`request`),
    jsonwebtoken    = require("jsonwebtoken"),
    //endregion node_modules

    enums           = {
        'jwt_decoding_type': {
            'decode': "decode",
            'verify': "verify"
        }
    },

    /**
     * @class Certificate
     */
    Certificate     = (function (/* outer_args */) {

        const
            private_properties = new WeakMap()
        ; // const

        /**
         *
         * @param {obj} obj
         * @returns {boolean}
         * @private
         */
        function _is_empty(obj) {
            for (let property in obj) {
                if (obj.hasOwnProperty(property)) return false;
            } // for (property)
            return true;
        } // _is_empty

        /**
         *
         * @param {string} str
         * @param {number} n
         * @returns {string}
         * @private
         */
        function _pem_encode(str, n) {

            let
                ret = [],
                result_
            ;

            for (let mod, i = 1; i <= str['length']; i++) {
                ret.push(str[i - 1]);
                mod = i % n;
                if (mod === 0) {
                    ret.push('\n')
                } // if ()
            } // for (i)

            result_ = `-----BEGIN CERTIFICATE-----\n${ret.join('')}\n-----END CERTIFICATE-----`;

            return result_
        } // _pem_encode

        /**
         *
         * @param {object} https
         * @param {string} host
         * @param {object} options
         * @returns {Promise<object>}
         * @private
         */
        function request_({https, host, options}) {

            if ((host['length'] <= 0) || (typeof host !== 'string')) {
                throw Error('need a valid URL');
            } // if ()

            return new Promise(function (resolve, reject) {

                let
                    request = https.get(options, (get_response) => {

                        let certificate = get_response.socket.getPeerCertificate();

                        if ((certificate === null) || _is_empty(certificate)) {
                            reject({'@type': "err", 'err': new Error("The website did not provide a certificate")});
                        } else {
                            if (certificate.raw) {
                                certificate.pem_encoded = _pem_encode(certificate.raw.toString('base64'), 64);
                            } // if ()
                            resolve(certificate);
                        } // if ()
                    })
                ; // let

                request['on']('error', (err) => {
                    reject(err);
                });

                request.end();

            }); // return new Promise
        } // request_

        class Certificate {

            /**
             *
             * @constructs Certificate
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
             * @name Certificate.request
             * @param {object} https
             * @param {string} host
             * @param {object} options
             * @returns {Promise}
             * @static
             */
            static request({https, host, options}) {
                return request_({'https': https, 'host': host, 'options': options});
            } // static request

            /**
             *
             * @name Certificate#request
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

        } // class Certificate

        return /* class */ Certificate;

    }(/* outer_args {} */)),
    //endregion class Certificate

    //region cert/key
    cert_path       = `${__dirname}${config.certificate_cert}`,
    key_path        = `${__dirname}${config.certificate_key}`,
    key             = fs.readFileSync(`${key_path}`),
    cert            = fs.readFileSync(`${cert_path}`),
    //endregion cert/key

    //region daps
    daps_scheme     = config.daps_scheme,
    daps_host       = config.daps_host,
    daps_port       = config.daps_port,
    daps_token_path = config.daps_token_path,
    //
    daps_url        = `${daps_scheme}://${daps_host}:${daps_port}`,
    daps_token_url  = `${daps_url}${daps_token_path}`
    //endregion daps

; // const

let
    /*
     * jwt_decoding: play around
     *      jwt_decoding_type.verify :: needs daps-dc's public-key
     *      jwt_decoding_type.decode :: not so secure :-(
     */
    jwt_decoding = enums.jwt_decoding_type.verify,
    //
    jwt_client_payload
; // let

/**
 * @typedef {object} JwtClientPayloadObject
 * @property {string} iss
 * @property {string} aud
 * @property {string} sub
 * @property {string} name
 * @property {number} exp
 * @property {object} @IDS
 * @property {(object|string)} @IDS.@context
 * @property {string} @IDS.@type
 * @property {object} @IDS.token_request
 * @property {string} @IDS.token_request.idsid
 * @property {string} @IDS.token_request.scope
 * @property {object} @IDS.token_request.attributes
 * @property {object} @IDS.token_request.attributes.SecurityProfile
 */

/**
 *
 * @type {JwtClientPayloadObject}
 */
jwt_client_payload = {
    'iss':  path_,
    'aud':  "DAPS_DC",
    'sub':  "request daps dc for security profile",
    'name': name,
    'exp':  ((new Date).valueOf() + (/* one hour */ 60 * 60 * 1000)),
    '@IDS': {
        '@context':      {
            'idsid': "ids:idsid"
        },
        '@type':         "token_request",
        "token_request": {
            'idsid':      idsid,
            'scope':      "requested attributes",
            'attributes': {
                /*
                 * SecurityProfile
                 * @link{http://ids.semantic-interoperability.org/ Industrial Data Space Information Model}
                 * remark: have a look at IDS' InfoModel
                 */
                'SecurityProfile': true
            }
        } // token_request
    } // @IDS
}; // jwt_client_payload

jsonwebtoken.sign(
    jwt_client_payload,
    key,
    /* options */ {
        'algorithm': config.jsonwebtoken_sign_algorith
    },
    (err, token) => {

        let
            payload = {
                'method':       "POST",
                'url':          daps_token_url,
                'auth':         {
                    'user': idsid,
                    'pass': ""
                }
                ,
                'form':         {
                    'grant_type':            "client_credentials",
                    'client_assertion_type': "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                    'client_assertion':      "JWTC1",
                    'token':                 token
                } // form
                ,
                'agentOptions': {
                    'key':  key,
                    'cert': cert
                }
            }
        ; // let

        console.log(`${path_} : payload : ${JSON.stringify(payload['form'])}`);

        request(payload, (err, res, body) => {

            try {

                const
                    json = JSON.parse(body)
                ;
                let
                    decoded_token
                ;

                console.log(`${path_} : json.token : ${JSON.stringify(json.token)}`);

                switch (jwt_decoding) {

                    case enums.jwt_decoding_type.verify:

                        Certificate.request({
                            'https':   require('https'),
                            'host':    `${daps_host}`,
                            'options': {
                                'hostname': daps_host,
                                'port':     8081,
                                'path':     "/",
                                'method':   "GET"
                            }
                        }).then((certificate) => {
                            jsonwebtoken.verify(json.token, certificate.pem_encoded, (err, decoded) => {
                                decoded_token = decoded;
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    console.log(`${path_} : jwt_decoding_type = 'verify' : decoded : ${JSON.stringify(decoded_token, "", "\t")}`);
                                } // if ()
                            });
                        }).catch((err) => {
                            console.log(`${path_} : Certificate.request : err : ${err.message}`);
                        });
                        break; // enums.jwt_decoding_type.verify

                    case enums.jwt_decoding_type.decode:
                        decoded_token = jsonwebtoken.decode(json.token);
                        console.log(`${path_} : jwt_decoding_type = 'decode' : decoded : ${JSON.stringify(decoded_token, "", "\t")}`);
                        break; // enums.jwt_decoding_type.decode

                    default:
                        console.log(`${path_} : decode : NONE`);
                        break; // default

                } // switch (jwt_decoding)

            } catch (jex) {
                console.log(`${path_} : exception : jex : ${JSON.stringify(jex)}`);
            } // try

        }); // request

    } // callback :: jsonwebtoken.sign

); // jsonwebtoken.sign()

