var http = require('http');
var sys = require('sys');
var url = require('url');
var qs = require('querystring');

var server = http.createServer(function (req, res) {
    var suffix = "/bmi";
    var bmi = 0, weight = 0, height = 0;

    //sys.puts("init!");

    res.writeHead(200, { "Content-Type": "text/html" })

    switch (url.parse(req.url).pathname) {
        case '/':
            res.write("Hello world!\n");
            res.write("<h2>BMI Test</h2>\n");
            res.write('<form action=' + suffix + ' method="post">\n');
            res.write("  Height: <input type='text' name='height' placeholder='cm'> Weight: <input type='text' name='weight' placeholder='kg'> <input type='submit'>\n");
            res.write("</form>");
            res.end();

            break;
        case '/bmi':
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                var post = qs.parse(body);
                weight = post.weight;
                height = post.height;
                bmi = weight / (height * height) * 10000;

                res.write("Your BMI index is <strong>" + bmi.toFixed(0) + "</strong>.");
                res.write("<p>(<code>20~25 is normal, 25~30 is over-weight, 30~ is obese</code>)</p>");
                res.write('<a href="javascript:history.back(1);">Back</a>');
                res.end();
            });

            break;
    }

    //var isBMI = pathname.indexOf(suffix, pathname.length - suffix.length) !== -1; // endsWith()
});
 
server.listen(process.env.PORT || 8001);
