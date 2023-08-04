class Widget:
    def __init__(self):
        html = """
        <html lang="en-US">
        <head>
            <title>Dynamic Demo</title>
        </head>
        <body>
            <h1>Dynamic Demo</h1>
            <p>This is a demo of a dynamically generated widget.</p>
            <p>Well, "dynamic" in terms of the server.</p>
        </body>
        </html>
        """

        self.html = html

    def render(self):
        return self.html