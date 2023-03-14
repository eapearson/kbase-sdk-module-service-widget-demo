# Try CRA-TS?

Okay, let us try CRA-TS, the real deal.

BUILD_PATH=../build npm run build 

## Use Cases

### App with data served from KBase services

- add @kbase/ui-lib or roll your own



### App for viewing an object


### Supporting multiple apps in same codebase



 ```python
from IPython.display import display, HTML
js = """

<div id="foo" />
<script>
require(['widgets/dynamicServiceSupport/wrapper'], ({DynamicServiceWrapper, $el}) => {
    const $host = $("#foo");
    const wrapper = new DynamicServiceWrapper($host, {maxHeight: '10em', showBorder: true});
    try {
        wrapper.$render('app4');
    } catch (ex) {
        $("#foo").text('Error! ' + ex.message);
    }
    
});
</script>
"""
display(HTML(js))
```

