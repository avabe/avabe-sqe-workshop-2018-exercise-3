/* eslint-disable no-console */
import $ from 'jquery';
import * as flowchart from 'flowchart.js';
import {parseCode, parse} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });

    $('#toGraphButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let args = $('#argumentsHolder').val();
        let cfg = parse(codeToParse, args);
        create_graph(cfg);
    });
});


function create_graph(cfg){
    document.getElementById('parsedCode').innerHTML = '';
    var diagram = flowchart.parse(cfg);
    diagram.drawSVG('parsedCode', {
        'flowstate': {
            'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' },
            'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'T', 'no-text' : 'F' }
        }
    });
}