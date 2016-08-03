
// This protractor scen file tests the tubularHttp.
describe('tbHttp', function () {
    beforeAll(function() {
        // Go to test
        browser.get('index.html');
        element(by.id('tbLogin')).click();
    });
    
    
    /*
    it('should perform login', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click().then(function(){
            expect($('#log').getText()).toBe('Login');
        });
    });
    */
    it('should be authenticated', function(){
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnAuth')).click().then(function(){
            expect($('#isAuth').getText()).toBe('is Authenticated!');
        }); 
    });
    
    it('should not login bad credentials', function(){
        browser.get('index.html');
        element(by.id('tbLogin')).click();
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.');
        element(by.id('submitBtn')).click().then(function(){
            expect($('#isAuth').getText()).toBe('false');
        });
    });
   
    it('should expirated', function(){
        browser.get('index.html');
        element(by.id('tbLogin')).click();
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnExp')).click().then(function(){
            expect($('#expAuth').getText()).toBe('Not Authenticated');
        });         
    });
});