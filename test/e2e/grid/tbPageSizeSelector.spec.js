'use strict';

describe('Component: Grid.Pager', () => {

  let scope, compile, templateCache, template, element, $httpBackend;
  let pageSelector, select, option;

  const serverUrl = 'api/data';

  beforeEach(module('tubular.tests'));
  beforeEach(module('tubular'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_, _$httpBackend_) {
    scope = _$rootScope_;
    compile = _$compile_;
    templateCache = _$templateCache_;
    $httpBackend = _$httpBackend_;
    scope.serverUrl = serverUrl;
  }));

  function generate(flush) {
    var tpl = templateCache.get('tbPageSizeSelector.case.html');
    template = angular.element(tpl);
    element = compile(template)(scope);
    if (flush) $httpBackend.flush();
    scope.$digest();
  }

  beforeEach(() => {
    generate();

    pageSelector = element.find('tb-page-size-selector');
    select = element.find('select');
    option = element.find('option');
  });

  it('should render page size selector', () => {  
    expect(pageSelector).toBeDefined();   
  });

  it('should have correct data', () => {  
    var label = pageSelector.find('label');

    expect($j(label).text().trim()).toBe('Page size:');
    expect($j(option[0]).is(':selected')).toBeTruthy();
    expect($j(option[0]).text().trim()).toBe('10');
    expect($j(option[1]).text().trim()).toBe('20');
    expect($j(option[2]).text().trim()).toBe('50');
    expect($j(option[3]).text().trim()).toBe('100');
  });

  it('should have selected 20 records', () => {  
    $j(select).val('number:20');

    expect($j(option[0]).is(':selected')).toBeFalsy();
    expect($j(option[1]).is(':selected')).toBeTruthy();
  });

  it('should have selected 50 records', () => {  
    $j(select).val('number:50');

    expect($j(option[1]).is(':selected')).toBeFalsy();
    expect($j(option[2]).is(':selected')).toBeTruthy();
  });

  it('should have selected 100 records', () => {  
    $j(select).val('number:100');

    expect($j(option[2]).is(':selected')).toBeFalsy();
    expect($j(option[3]).is(':selected')).toBeTruthy();
  });
});