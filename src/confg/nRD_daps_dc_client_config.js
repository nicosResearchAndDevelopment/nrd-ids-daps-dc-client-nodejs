module.exports = {
    /*
     * @context :: some JSON-LD fake
     */
    "@context":                   {},
    'name': "YOUR connectors name",
    /*
     * idsid :: also known as IDS-Key, but: to be discussed
     *          It is very important to use this guy in a proper way: it has to be THE SAME
     *          as the identifier in your certificate (under 'subjectAltName')!!!
     * TODO: fill in YOUR connectors IDS-identifier (takaids-key: "the artist also known as IDS-Key)
     */
    'idsid':                      "http://www.nicos-rd.com/IDS/connector/?s=bee",
    /* TODO:
     * certificate_cert :: fill in YOUR's
     */
    'certificate_cert':           "/cert/myCconnector.cert",
    /* TODO:
     * certificate_key :: fill in YOUR's
     */
    'certificate_key':            "/cert/myCconnector.key",
    //
    /*
     * daps_* :: leave it as it is...
     */
    'daps_scheme':                "https",
    'daps_host':                  "daps-dc.nicos-ag.com",
    'daps_port':                  8081,
    'daps_token_path':            "/token",
    //
    'jsonwebtoken_sign_algorith': "RS256"
}; // module.exports
