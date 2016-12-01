const path = require("path");
const fs = require("fs");

module.exports = function (source) {
  // tell webpack that the output from this loader is cacheable
  this.cacheable();

  // match any ".js" file
  const re = /(\w+)\.js$/;
  const matches = re.exec(this.request);
  if (matches) {
    // since this is a ".js" file, we _may_ need to do some processing, so let webpack know that we'll be async
    var callback = this.async();

    // try to find a corresponding ".less" file matching the base name of the ".js" file
    const basename = matches[1];
    const filename = matches[1] + ".less";
    var filepath = path.join(this.context, filename);
    fs.access(filepath, fs.constants.F_OK, function (err) {
      if (err) {
        // File does not exist, so just return the unmodified source
        callback(null, source);
      } else {
        // .less file is present, so inject it
        console.log("Injecting style " + filepath);
        var out = "import Style from './" + filename + "';\n" + source;

        const re = /export default.*\{/;
        const matches = re.exec(out);
        if (matches) {
          // we are able to determine where to inject the template, so do it
          const i = matches.index + matches[0].length;
          const className = basename.replace("_", "-");
          out = out.substring(0, i)
            + "\n  className: '." + className + "',"
            + out.substring(i);
        }

        callback(null, out);
      }
    });

  } else {
    // since this was not a ".js" file, there is no processing for us to do, so return the unmodified source
    return source;
  }
};
