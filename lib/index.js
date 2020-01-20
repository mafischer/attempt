/**
 * A wrapper function that will retry the wrapped function
 * @param action The function that is to be attempted
 * @param options The input to the attempted function
 * @param callback The callback function that is used after success or fail
 * @param [retryOptions=function(options){return {...options};}] If included, a function used to mutate the options object for each attempts
 * @param [max=3] The maximum number attempts that will be attempted
 * @param [attempts=1] The current attempt, should be initiated with 1.
 */
function attempt(action, options, callback, retryOptions, max, attempts) {
    // use provided retryOptions or default
    const DYNAMIC = retryOptions || function(options){
        return {...options};
    };
    // use provided attempts or default to 1
    const ATTEMPTS = attempts || 1;
    // use provided max or default to MAX_ATTEMPTS
    const MAX = max || MAX_ATTEMPTS;

    let opts = options;
    if(ATTEMPTS > 1){
        opts = DYNAMIC(options);
    }
    action(options, function(err, results){
        if(err){
            exports.splunkLog({ message:{
                    timestamp: new Date().toISOString(),
                    serviceName: "shelf_api",
                    logType: "ATTEMPT",
                    serviceId: os.hostname(),
                    logDetails: {
                        attempt: ATTEMPTS,
                        error: err,
                        action: '' + action
                    },
                    environment: process.env.NODE_ENV,
                    version: info.version
                }, severity:'warn'});
            // retry if MAX attempts is not exhausted
            if(ATTEMPTS < MAX) {
                setTimeout(function(){
                    return exports.attempt(action, opts, callback, DYNAMIC, MAX, ATTEMPTS + 1);
                }, 50);
                //return exports.attempt(action, options, callback, MAX, ATTEMPTS + 1);
            } else {
                // return error after MAX attempts are exhausted
                return callback(err);
            }
        } else {
            // return success
            return callback(null, {
                results,
                opts
            });
        }
    });

}

module.exports = {
    attempt
};