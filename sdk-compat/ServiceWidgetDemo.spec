/*
A KBase module: WidgetDemo
*/
module WidgetDemo {
    typedef structure {
        string foo;
    } Bar;

    funcdef run_WidgetDemo(mapping<string,UnspecifiedObject> params) returns (Bar output) authentication required;
};
