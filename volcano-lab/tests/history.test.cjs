const test=require('node:test');
const assert=require('node:assert/strict');
const {calculate}=require('../js/model.js');
const {match,cases}=require('../js/history.js');
test('contrasting results choose appropriate documented phases',()=>{
  assert.equal(match(calculate(15,15)),cases.effusive);
  assert.equal(match(calculate(90,90)),cases.explosive);
  assert.equal(match(calculate(90,10)),cases.dome);
  assert.equal(match(calculate(10,100)),cases.fountain);
});
test('intermediate or invalid results do not force a historical analogy',()=>{
  assert.equal(match(calculate(40,40)),null);
  assert.equal(match(null),null);
  assert.equal(match({flow:NaN,intensity:80,ash:80,viscosity:90}),null);
  assert.equal(match({flow:10,intensity:101,ash:80,viscosity:90}),null);
});
test('all selected cases have a year, analogy limitations, and authoritative links',()=>{
  for(let v=0;v<=100;v++)for(let g=0;g<=100;g++){
    const c=match(calculate(v,g));if(!c)continue;
    assert.ok(c.year&&c.summary&&c.similarity&&c.limits);
    assert.ok(['www.usgs.gov','pubs.usgs.gov'].includes(new URL(c.source).hostname));
  }
});
