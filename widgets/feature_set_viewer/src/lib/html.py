class Tag:
    def __init__(self, tag_name: str, content: str):
        html = f'<{tag_name}>{content}</{tag_name}>'
        self.html = html

    def _repr_html_(self):
        return self.html

class Table:
    def __init__(self, header, rows):
        html = '<table class="table"><thead><tr>'
        for field in header:
            html += f'<th>{field}</th>'
        html += '</tr></thead><tbody>'
        for row in rows:
            html += '<tr>'
            for field in row:
                html += f'<td>{field}</td>'
            html += '</tr>'
        html += '</tbody></table>'
        self.html = html
    def _repr_html_(self):
        return self.html