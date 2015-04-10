//a single all-encompassing module so we just need to reference this in page controllers, and have access to everything registered here
angular.module('alertsolutions', [
    'as.services',
    'as.messageEditors'
]);

// services, one for the root url, one to get mergefields, one the get message templates
var asServicesModule = angular.module('as.services', []);
asServicesModule.factory('urlProvider', ['$q', '$http', '$log', function ($q, $http, $log) {
    return {
        GetRootURL: function () {
            var d = $q.defer();
            var GetRoolUrlActionRoute = "/Helper/GetRootURL";
            $http.get(GetRoolUrlActionRoute).success(function (data) {
                var data = data.replace(/"/g, ''); // need to get rid of extra quotes
                d.resolve(data);
            });
            return d.promise;
        }
    };
}]);
asServicesModule.factory('messageTemplateService', ['$q', '$http', '$log', 'urlProvider', function ($q, $http, $log, urlProvider) {
    return {
        GetMessageTemplates: function (fileGroups) {
            var d = $q.defer();
            urlProvider.GetRootURL().then(function (rootUrl) {
                var fullUrl = rootUrl + "File/GetListOfMessageTemplates";
                $http({
                    method: 'GET',
                    url: fullUrl,
                    params: { fileGroups: fileGroups }
                }).success(function (data) {
                    d.resolve(data);
                });
            });
            return d.promise;
        },
        GetMessageTemplateByID: function (messageTemplateID) {
            var d = $q.defer();
            urlProvider.GetRootURL().then(function (rootUrl) {
                var fullUrl = rootUrl + "File/GetMessageTemplateData";
                $http({
                    method: 'GET',
                    url: fullUrl,
                    params: { messageTemplateID: messageTemplateID }
                }).success(function (data) {
                    d.resolve(data);
                });
            });
            return d.promise;
        }
    };
}]);
asServicesModule.factory('mergeFieldService', ['$q', '$http', '$log', 'urlProvider', function ($q, $http, $log, urlProvider) {
    return {
        GetMergeFields: function () {
            var d = $q.defer();
            urlProvider.GetRootURL().then(function (rootUrl) {
                var fullUrl = rootUrl + "File/GetMergeFields";
                $http.get(fullUrl).success(function (data) {
                    d.resolve(data);
                });
            });
            return d.promise;
        }
    };
}]);

// a single module to encompass the messageEditor angular code
var asMessageEditorsModule = angular.module('as.messageEditors', [
    'as.templates',
    'as.services',
    'as.messageEditors.textEditor',
    'as.messageEditors.htmlEditor',
    'as.messageEditors.mergeFieldDropDown',
    'as.messageEditors.messageTemplateDropDown',
    'as.messageEditors.enhancedTextEditor',
    'as.messageEditors.enhancedHtmlEditor',
    'as.messageEditors.smsEditor',
    'as.messageEditors.emailEditor',
    'as.messageEditors.simpleVoiceEditor',
]);

// This uses the angular bootstrap ui pattern: each directive lives in it's own module
// you can define the controller, keep logic in that, and register it with the directive itself
// you can use the controller and it's scope with the directive's template the way you'd expect and controller to work with an html page
// Note: I prefix all the directive's with as (eg asDirectiveName) to avoid any potential name collisions with any other angular libraries

// basic directives
angular.module('as.messageEditors.mergeFieldDropDown', [])
    .directive('asMergeFieldDropDown', function ($templateCache) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/asmergefielddropdown.html',
            scope: {
                text: '@',
                mergeFields: '=',
                onMergeFieldSelect: '&',
            },
        };
    });

angular.module('as.messageEditors.messageTemplateDropDown', [])
    .directive('asMessageTemplateDropDown', function ($templateCache, messageTemplateService) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/asmessagetemplatedropdown.html',
            scope: {
                text: '@',
                messageTemplates: '=',
                onMessageTemplateSelect: '&',
            },
        };
    });

angular.module('as.messageEditors.textEditor', [])
    .controller('TextEditorController', ['$scope', '$log', function ($scope, $log) {
        $scope.limitText = function (text, maxCharacters) {
            if (text && maxCharacters) {
                if (text.length > maxCharacters) {
                    return text.substring(0, maxCharacters);
                }
            }
            return text;
        };
        $scope.change = function () {
            if ($scope.content) {
                $scope.content = $scope.limitText($scope.content, $scope.inputLimit);
            }
        };
        $scope.insertIntoContent = function (startPos, endPos, insertedContent) {
            if ($scope.content === undefined) {
                $log.error('textEditor: no content model');
            } else {
                $log.debug('Insert into TextEditor', startPos, endPos, insertedContent);
                $scope.content = $scope.content.substring(0, startPos) + insertedContent +
                $scope.content.substring(endPos, $scope.content.length);
            }
        };
    }])
    .directive('asTextEditor', function ($templateCache) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/astexteditor.html',
            scope: {
                content: '=',
                onChange: '&',
                rows: '@',
                cols: '@',
                inputLimit: '@',
                placeHolder: '@',
                setInsertFunc: '&',
            },
            controller: 'TextEditorController',
            link: function (scope, element, attrs) {
                scope.insert = function (insertedContent) {
                    var domElement = element[0];
                    var startPos = domElement.selectionStart;
                    var endPos = domElement.selectionEnd;
                    //change the model instead of the value of the element
                    scope.insertIntoContent(startPos, endPos, insertedContent);
                    domElement.focus();
                };
                
                // to understand how this insert function works, take a look at:
                // http://stackoverflow.com/questions/15991137/calling-method-of-parent-controller-from-a-directive-in-angularjs
                // basically the page controller gives a function to this directive, and it gets called here
                // and we pass the actual insert method as a property of an anonymous object to that function
                // the parent can then use the property to get the function and attach it to it's scope and can call it
                // Be careful: you have to remember to use the correct name here, and where you pass this function into the direct (in the html)
                scope.setInsertFunc({ insertFunction: scope.insert });
                
                scope.$watch('content', function (newValue, oldValue) {
                    if (newValue)
                        scope.onChange();
                });
            }
        };
    });

// intended that someone should use the html editor, and not the ckeditor directive, which
// needs some items on the scope of the htmleditor
angular.module('as.messageEditors.htmlEditor', [])
    .controller('HtmlEditorController', ['$scope', '$log', function($scope, $log) {
        $scope.limitText = function(text, maxCharacters) {
            if (text && maxCharacters) {
                if (text.length > maxCharacters) {
                    return text.substring(0, maxCharacters);
                }
            }
            return text;
        };
        $scope.change = function() {
            if ($scope.content) {
                $scope.content = $scope.limitText($scope.content, $scope.inputLimit);
            }
        };
        $scope.insertIntoContent = function(startPos, endPos, insertedContent) {
            if ($scope.content === undefined) {
                $log.error('HtmlEditor: no content model');
            } else {
                $log.debug('Insert into HtmlEditor:', startPos, endPos, insertedContent);
                $scope.content = $scope.content.substring(0, startPos) + insertedContent +
                    $scope.content.substring(endPos, $scope.content.length);
            }
        };
    }])
    .directive('asHtmlEditor', function($templateCache) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/ashtmleditor.html',
            scope: {
                ckEditorOptions: '=',
                content: '=',
                onChange: '&',
                inputLimit: '@',
                setInsertFunc: '&',
            },
            controller: 'HtmlEditorController',
            link: function (scope, element, attrs) {
                scope.insert = function (insertedContent) {
                    scope.$broadcast('ckInsert', insertedContent);
                };
                scope.setInsertFunc({ insertFunction: scope.insert });

                scope.$watch('content', function(newValue, oldValue) {
                    if (newValue)
                        scope.onChange();
                });
            }
        };
    })
    .directive('ckEditor', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, elm, attr, ngModel) {
                var ck = CKEDITOR.replace(elm[0], scope.ckEditorOptions);

                scope.$on('ckInsert', function(event, value) {
                    ck.insertText(value);
                });

                if (!ngModel) return;
                
                ck.on('pasteState', function() {
                    scope.$apply(function() {
                        ngModel.$setViewValue(ck.getData());
                    });
                });
                ngModel.$render = function(value) {
                    ck.setData(ngModel.$viewValue);
                };
            }
        };
    });

// Enhanced editor directives
angular.module('as.messageEditors.enhancedHtmlEditor', [])
    .controller('EnhancedHtmlEditorController', ['$scope', '$log', 'messageTemplateService', function ($scope, $log, messageTemplateService) {
        $scope.selectMergeField = function (mergeField) {
            $log.debug('enhancedText insert mergefield', mergeField);
            $scope.htmlEditorInsert("%%" + mergeField + "%%");
        };
        $scope.selectMessageTemplate = function (messageTemplate) {
            $scope.clear();
            $log.debug('enhancedText select template', messageTemplate);
            messageTemplateService.GetMessageTemplateByID(messageTemplate.MessageTemplateID).then(function (data) {
                if (data.MessageTemplateData) {
                    $scope.htmlEditorInsert(data.MessageTemplateData);
                }
            }).catch(function (data) {
                $log.error('enhancedText retrieve template', data);
            });
        };
        $scope.setHtmlEditorInsert = function (insertFunction) {
            $scope.htmlEditorInsert = insertFunction;
        };
        $scope.clear = function () {
            $scope.content = "";
        };
    }])
    .directive('asEnhancedHtmlEditor', function($templateCache) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/asenhancedhtmleditor.html',
            scope: {
                ckEditorOptions: '=',
                content: '=',
                onChange: '&',
                mergeFields: '=',
                messageTemplates: '=',
            },
            controller: 'EnhancedHtmlEditorController',
        };
    });

angular.module('as.messageEditors.enhancedTextEditor', [])
    .controller('EnhancedTextEditorController', ['$scope', '$log', 'messageTemplateService', function ($scope, $log, messageTemplateService) {
        $scope.selectMergeField = function (mergeField) {
            $log.debug('enhancedText insert mergefield', mergeField);
            $scope.textEditorInsert("%%" + mergeField + "%%");
        };
        $scope.selectMessageTemplate = function (messageTemplate) {
            $scope.clear();
            $log.debug('enhancedText select template', messageTemplate);
            messageTemplateService.GetMessageTemplateByID(messageTemplate.MessageTemplateID).then(function (data) {
                if (data.MessageTemplateData) {
                    $scope.textEditorInsert(data.MessageTemplateData);
                }
            }).catch(function (data) {
                $log.error('enhancedText retrieve template', data);
            });
        };
        $scope.setTextEditorInsert = function (insertFunction) {
            $scope.textEditorInsert = insertFunction;
        };
        $scope.clear = function () {
            $scope.content = "";
        };
    }])
    .directive('asEnhancedTextEditor', function ($templateCache) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/asenhancedtexteditor.html',
            scope: {
                content: '=',
                onChange: '&',
                mergeFields: '=',
                messageTemplates: '=',
            },
            controller: 'EnhancedTextEditorController',
        };
    });

// Channel specific editor directives
angular.module('as.messageEditors.smsEditor', [])
    .controller('SmsEditorController', ['$scope', '$log', 'messageTemplateService', function ($scope, $log, messageTemplateService) {
        $scope.isOverFlow = false;
        $scope.selectMergeField = function (mergeField) {
            $log.debug('sms insert mergefield', mergeField);
            $scope.textEditorInsert("%%" + mergeField + "%%");
        };
        $scope.selectMessageTemplate = function (messageTemplate) {
            $scope.clear();
            $log.debug('sms select template', messageTemplate);
            messageTemplateService.GetMessageTemplateByID(messageTemplate.MessageTemplateID).then(function (data) {
                if (data.MessageTemplateData) {
                    $scope.textEditorInsert(data.MessageTemplateData);
                }
            }).catch(function (data) {
                $log.error('sms retrieve template', data);
            });
        };
        $scope.setTextEditorInsert = function (insertFunction) {
            $scope.textEditorInsert = insertFunction;
        };
        $scope.clear = function () {
            $scope.content = "";
        };
        $scope.onChange = function () {
            if ($scope.content.length > $scope.countLimit) {
                $scope.isOverFlow = true;
            } else {
                $scope.isOverFlow = false;
            }
        };
    }])
    .directive('asSmsEditor', function ($templateCache) {
        var directive = {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/assmseditor.html',
            scope: {
                content: '=',
                senderId: '@',
                countLimit: '@',
                mergeFields: '=',
                messageTemplates: '=',
                placeholder: '@',
            },
            controller: 'SmsEditorController',
        };
        return directive;
    });

angular.module('as.messageEditors.emailEditor', [])
    .controller('EmailEditorController', ['$scope', '$log', 'messageTemplateService', function ($scope, $log, messageTemplateService) {
        $scope.selectMergeField = function (mergeField) {
            $log.debug('email insert mergefield', mergeField);
            $scope.textEditorInsert("%%" + mergeField + "%%");
        };
        $scope.selectMessageTemplate = function (messageTemplate) {
            $scope.clear();
            $log.debug('email select template', messageTemplate);
            messageTemplateService.GetMessageTemplateByID(messageTemplate.MessageTemplateID).then(function (data) {
                if (data.MessageTemplateData) {
                    $scope.textEditorInsert(data.MessageTemplateData);
                }
            }).catch(function (data) {
                $log.error('email retrieve template', data);
            });
        };
        $scope.setTextEditorInsert = function (insertFunction) {
            $scope.textEditorInsert = insertFunction;
        };
        $scope.clear = function () {
            $scope.editModel.content = "";
        };
    }])
    .directive('asEmailEditor', function ($templateCache) {
        var directive = {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/asemaileditor.html',
            scope: {
                ckEditorOptions: '=',
                editModel: '=',
                mergeFields: '=',
                messageTemplates: '=',
                placeholder: '@',
            },
            controller: 'EmailEditorController',
        };
        return directive;
    });

angular.module('as.messageEditors.simpleVoiceEditor', [])
    .controller('SimpleVoiceEditorController', ['$scope', '$log', 'messageTemplateService', function ($scope, $log, messageTemplateService) {
        $scope.selectMergeField = function (mergeField) {
            $log.debug('voice insert mergefield', mergeField);
            $scope.textEditorInsert("%%" + mergeField + "%%");
        };
        $scope.selectMessageTemplate = function (messageTemplate) {
            $scope.clear();
            $log.debug('voice select template', messageTemplate);
            messageTemplateService.GetMessageTemplateByID(messageTemplate.MessageTemplateID).then(function (data) {
                if (data.MessageTemplateData) {
                    $scope.textEditorInsert(data.MessageTemplateData);
                }
            }).catch(function (data) {
                $log.error('voice retrieve template', data);
            });
        };
        $scope.setTextEditorInsert = function (insertFunction) {
            $scope.textEditorInsert = insertFunction;
        };
        $scope.clear = function () {
            $scope.content = "";
        };
    }])
    .directive('asSimpleVoiceEditor', function ($templateCache) {
        var directive = {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'messageeditors/assimplevoiceeditor.html',
            scope: {

                content: '=',
                mergeFields: '=',
                messageTemplates: '=',
                placeholder: '@',
            },
            controller: 'SimpleVoiceEditorController',
        };
        return directive;
    });