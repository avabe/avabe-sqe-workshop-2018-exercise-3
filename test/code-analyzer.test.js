import assert from 'assert';
import {parse} from '../src/js/code-analyzer';

describe('The javascript parser', () => {

    it('test 1: is parsing a simple function without arguments', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let a = x + 1;\n' +
            '}';
        assert.deepEqual(
            parse(func, ''),
            'op0=>operation: a = x + 1|approved\n' +
            '\n' +
            'op0->'
        );
    });

    it('test 2: is parsing a simple function with arguments', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let a = x + 1;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,1,1'),
            'op0=>operation: a = x + 1|approved\n' +
            '\n' +
            'op0->'
        );
    });

    it('test 3: is parsing function with a simple return statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,1,1'),
            'op0=>operation: a = x + 1|approved\n' +
            'ret=>operation: return a|approved\n' +
            '\n' +
            'op0->ret\n'
        );
    });

    it('test 4: is parsing function with a simple if statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    if(a < z){\n' +
            '        a = a + x;\n' +
            '    }\n' +
            '    else{\n' +
            '        a = a + y;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,3'),
            'op0=>operation: a = x + 1|approved\n' +
            'cond1=>condition: a < z|approved\n' +
            'op1=>operation: a = a + x\n' +
            '|approved\n' +
            'op2=>operation: a = a + y\n' +
            '|rejected\n' +
            'ret=>operation: return a|approved\n' +
            '\n' +
            'op0->cond1\n' +
            'cond1(yes)->op1->ret\n' +
            'cond1(no)->op2->ret\n'
        );
    });

    it('test 5: is parsing function with a simple if statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    if(a < z){\n' +
            '        a = a + x;\n' +
            '    }\n' +
            '    else{\n' +
            '        a = a + y;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,1'),
            'op0=>operation: a = x + 1|approved\n' +
            'cond1=>condition: a < z|approved\n' +
            'op1=>operation: a = a + x\n' +
            '|rejected\n' +
            'op2=>operation: a = a + y\n' +
            '|approved\n' +
            'ret=>operation: return a|approved\n' +
            '\n' +
            'op0->cond1\n' +
            'cond1(yes)->op1->ret\n' +
            'cond1(no)->op2->ret\n'
        );
    });

    it('test 6: is parsing function with a simple while statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let c = 2;\n' +
            '   \n' +
            '   while (c < z) {\n' +
            '       c = a + b;\n' +
            '   }\n' +
            '   \n' +
            '   return z;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,3'),
            'op0=>operation: c = 2|approved\n' +
            'null1=>operation: NULL|approved\n' +
            'while1=>condition: c < z|approved\n' +
            'op1=>operation: c = a + b\n' +
            '|approved\n' +
            'ret=>operation: return z|approved\n' +
            '\n' +
            'op0->null1->while1\n' +
            'while1(yes)->op1->null1\n' +
            'while1(no)->ret\n'
        );
    });

    it('test 7: is parsing function with a simple while statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let c = 2;\n' +
            '   \n' +
            '   while (c < z) {\n' +
            '       c = a + b;\n' +
            '   }\n' +
            '   \n' +
            '   return z;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,1'),
            'op0=>operation: c = 2|approved\n' +
            'null1=>operation: NULL|approved\n' +
            'while1=>condition: c < z|approved\n' +
            'op1=>operation: c = a + b\n' +
            '|rejected\n' +
            'ret=>operation: return z|approved\n' +
            '\n' +
            'op0->null1->while1\n' +
            'while1(yes)->op1->null1\n' +
            'while1(no)->ret\n'
        );
    });

    it('test 8: testing example 1', () => {
        let func = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}\n';
        assert.deepEqual(
            parse(func, '1,2,3'),
            'op0=>operation: a = x + 1\n' +
            'b = a + y\n' +
            'c = 0|approved\n' +
            'cond1=>condition: b < z|approved\n' +
            'op1=>operation: c = c + 5\n' +
            '|rejected\n' +
            'cond3=>condition: b < z * 2|approved\n' +
            'op3=>operation: c = c + x + 5\n' +
            '|approved\n' +
            'op4=>operation: c = c + z + 5\n' +
            '|rejected\n' +
            'ret=>operation: return c|approved\n' +
            '\n' +
            'op0->cond1\n' +
            'cond1(yes)->op1->ret\n' +
            'cond1(no)->cond3\n' +
            'cond3(yes)->op3->ret\n' +
            'cond3(no)->op4->ret\n'
        );
    });

    it('test 9: testing example 2', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let a = x + 1;\n' +
            '   let b = a + y;\n' +
            '   let c = 0;\n' +
            '   \n' +
            '   while (a < z) {\n' +
            '       c = a + b;\n' +
            '       z = c * 2;\n' +
            '       a++;\n' +
            '   }\n' +
            '   \n' +
            '   return z;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,3'),
            'op0=>operation: a = x + 1\n' +
            'b = a + y\n' +
            'c = 0|approved\n' +
            'null1=>operation: NULL|approved\n' +
            'while1=>condition: a < z|approved\n' +
            'op1=>operation: c = a + b\n' +
            'z = c * 2\n' +
            'a++\n' +
            '|approved\n' +
            'ret=>operation: return z|approved\n' +
            '\n' +
            'op0->null1->while1\n' +
            'while1(yes)->op1->null1\n' +
            'while1(no)->ret\n'
        );
    });

    it('test 10: testing function with if statement nested in while statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let a = x + 1;\n' +
            '   let b = a + y;\n' +
            '   let c = 0;\n' +
            '   \n' +
            '   while (a < z) {\n' +
            '       if (a == 1) {\n' +
            '           c = a + b;\n' +
            '           z = c * 2;\n' +
            '       }\n' +
            '       else {\n' +
            '           a++;\n' +
            '       }\n' +
            '   }\n' +
            '   \n' +
            '   return z;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,3'),
            'op0=>operation: a = x + 1\n' +
            'b = a + y\n' +
            'c = 0|approved\n' +
            'null1=>operation: NULL|approved\n' +
            'while1=>condition: a < z|approved\n' +
            'cond2=>condition: a == 1|approved\n' +
            'op2=>operation: c = a + b\n' +
            'z = c * 2\n' +
            '|rejected\n' +
            'op3=>operation: a++\n' +
            '|approved\n' +
            'ret=>operation: return z|approved\n' +
            '\n' +
            'op0->null1->while1\n' +
            'while1(yes)->cond2\n' +
            'cond2(yes)->op2->ret\n' +
            'cond2(no)->op3->null1\n' +
            'while1(no)->ret\n'
        );
    });

    it('test 11: testing function with if statement nested in while statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '   let a = x + 1;\n' +
            '   let b = a + y;\n' +
            '   let c = 0;\n' +
            '   \n' +
            '   while (a < z) {\n' +
            '       if (a == 1) {\n' +
            '           c = a + b;\n' +
            '           z = c * 2;\n' +
            '       }\n' +
            '       else {\n' +
            '           a++;\n' +
            '       }\n' +
            '   }\n' +
            '   \n' +
            '   return z;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,1'),
            'op0=>operation: a = x + 1\n' +
            'b = a + y\n' +
            'c = 0|approved\n' +
            'null1=>operation: NULL|approved\n' +
            'while1=>condition: a < z|approved\n' +
            'cond2=>condition: a == 1|rejected\n' +
            'op2=>operation: c = a + b\n' +
            'z = c * 2\n' +
            '|rejected\n' +
            'op3=>operation: a++\n' +
            '|approved\n' +
            'ret=>operation: return z|approved\n' +
            '\n' +
            'op0->null1->while1\n' +
            'while1(yes)->cond2\n' +
            'cond2(yes)->op2->ret\n' +
            'cond2(no)->op3->null1\n' +
            'while1(no)->ret\n'
        );
    });

    it('test 12: is parsing function with a simple if statement without arguments', () => {
        let func = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    if(a < z){\n' +
            '        a = a + x;\n' +
            '    }\n' +
            '    else{\n' +
            '        a = a + y;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        assert.deepEqual(
            parse(func, ''),
            'op0=>operation: a = x + 1|approved\n' +
            'cond1=>condition: a < z|approved\n' +
            'op1=>operation: a = a + x\n' +
            '|rejected\n' +
            'op2=>operation: a = a + y\n' +
            '|approved\n' +
            'ret=>operation: return a|approved\n' +
            '\n' +
            'op0->cond1\n' +
            'cond1(yes)->op1->ret\n' +
            'cond1(no)->op2->ret\n'
        );
    });

    it('test 13: testing function with a simple while statement nested in if statement', () => {
        let func = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        while (c < z) {\n' +
            '            c = c + 5;\n' +
            '        }\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';
        assert.deepEqual(
            parse(func, '1,2,1'),
            'op0=>operation: a = x + 1\n' +
            'b = a + y\n' +
            'c = 0|approved\n' +
            'cond1=>condition: b < z|approved\n' +
            'null2=>operation: NULL|rejected\n' +
            'while2=>condition: c < z|rejected\n' +
            'op2=>operation: c = c + 5\n' +
            '|approved\n' +
            'op3=>operation: c = c + z + 5\n' +
            '|approved\n' +
            'ret=>operation: return c|approved\n' +
            '\n' +
            'op0->cond1\n' +
            'cond1(yes)->null2->while2\n' +
            'while2(yes)->op2->null2\n' +
            'while2(no)->ret\n' +
            'cond1(no)->op3->ret\n'
        );
    });
});
