from jsmin import jsmin

def minify_js_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as infile:
        original_js = infile.read()
    minified_js = jsmin(original_js)
    with open(output_path, 'w', encoding='utf-8') as outfile:
        outfile.write(minified_js)
    print(f"Minified file saved to {output_path}")

input_file = '3.1.js'
output_file = '3.1.min.js'
minify_js_file(input_file, output_file)

input_file = '4.1.js'
output_file = '4.1.min.js'
minify_js_file(input_file, output_file)
