export default function() {
    /**
     * 
     * @param {string} fileUrl   | url
     * @param {function} onLoad  | callback once is loaded
     * @param {function} onError | callback if there is an error
     */
    function loadRemoteFile(fileUrl, onLoad, onError) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', fileUrl, true);
        xhr.responseType = 'arraybuffer';
        xhr.crossOrigin = 'anonymous';

        xhr.onload = function(e) {
            if (this.status == 200) {
                var data = this.response;
                if( onLoad ) {
                    onLoad(data);
                }
            }
        };
        if( onError ) {
            xhr.onerror = onerror;
        }
        xhr.send();
    }

    /**
     * Converts arrayBuffer to string
     * @param {string} data 
     * @returns string | converted data
     */
    function arrayBufferToString(data) {
        return new TextDecoder('utf-8').decode(data);
    }

    // Exports
    return {
        loadRemoteFile: loadRemoteFile,
        arrayBufferToString: arrayBufferToString
    };
}