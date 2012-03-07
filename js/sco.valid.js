/* ==========================================================
 * sco.valid.js
 * http://github.com/terebentina/sco.js
 * ==========================================================
 * Copyright 2012 Dan Caragea.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function($) {
	"use strict";

	$.scovalid = function( $form, options ) {
		this.$form = $form;
		this.options = $.extend({}, $.scovalid.defaults, options);
		this.form_fields = this.$form.serializeArray();
		this.allowed_rules = [];
		var that = this;
		$.each(this.methods, function(k,v) {
			that.allowed_rules.push(k);
		});
	};

	$.extend($.scovalid, {
		defaults: {
			debug: false
			,rules: {}
			,messages: {}
		}

		,prototype: {
			// this is the main function - it returns either true if the validation passed or an object like {field1: 'error text', field2: 'error text', ...}
			validate: function() {
				var errors = {}
					,that = this;
				$.each(this.form_fields, function(idx, field) {
					//console.log('idx', idx, value);
					if (typeof that.options.rules[field.name] !== 'undefined') {
						var rules = that.options.rules[field.name]
							,result;
						$.each(rules, function(rule_idx, rule_value) {
							var fn_name, fn_args;
							// only string and objects are allowed
							if ($.type(rule_value) == 'string') {
								fn_name = rule_value;
							} else {
								// if not string then we assume it's a {key: val} object. Only 1 key is allowed
								$.each(rule_value, function(k, v) {
									fn_name = k;
									fn_args = v;
									return false;
								});
							}
							if ($.inArray(fn_name, that.allowed_rules) !== -1) {
								result = that.methods[fn_name].call(that, field.name, field.value, fn_args);
								if (result !== true) {
									errors[field.name] = that.format.call(that, field.name, fn_name, fn_args);
								}
							}
						});
					}
				});

				if (errors !== {}) {
					return errors;
				} else {
					return true;
				}
			}


			,methods: {
				not_empty: function(field, value) {
					return $.trim(value).length > 0;
				}

				,min_length: function(field, value, min_len) {
					return $.trim(value).length >= min_len;
				}

				,max_length: function(field, value, max_len) {
					return $.trim(value).length <= max_len;
				}

				,regex: function(field, value, regexp) {
					return regexp.test(value);
				}

				,email: function(field, value, params) {
					// by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
					return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test($.trim(value));
				}

				,url: function(field, value, params) {
					// by Scott Gonzalez: http://projects.scottsplayground.com/iri/
					return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
				}

				,exact_length: function(field, value, exact_length) {
					return $.trim(value).length == exact_length;
				}

				,equals: function(field, value, target) {
					return value === target;
				}

				,ip: function(field, value, params) {

				}

				,credit_card: function(field, value, params) {
					// accept only spaces, digits and dashes
					if (/[^0-9 \-]+/.test(value)) {
						return false;
					}
					var nCheck = 0,
						nDigit = 0,
						bEven = false;

					value = value.replace(/\D/g, "");

					for (var n = value.length - 1; n >= 0; n--) {
						var cDigit = value.charAt(n);
						nDigit = parseInt(cDigit, 10);
						if (bEven) {
							if ((nDigit *= 2) > 9) {
								nDigit -= 9;
							}
						}
						nCheck += nDigit;
						bEven = !bEven;
					}

					return (nCheck % 10) === 0;
				}

				,alpha: function(field, value, params) {

				}

				,alpha_numeric: function(field, value, params) {

				}

				,alpha_dash: function(field, value, params) {

				}

				,digit: function(field, value, params) {

				}

				,numeric: function(field, value, params) {
					return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
				}

				,range: function(field, value, params) {

				}

				,decimal: function(field, value, params) {
					return /^\d+$/.test(value);
				}

				,color: function(field, value, params) {

				}

				,matches: function(field, value, param) {
					return value === this.$form.find(param).val();
				}
			}


			,errors: {
				not_empty: 'This field is required.'
				,min_length: 'Please enter at least {value} characters.'
				,max_length: 'Please enter no more than {value} characters.'
				,regex: ''
				,email: 'Please enter a valid email address.'
				,url: 'Please enter a valid URL.'
				,exact_length: 'Please enter exactly {value} characters.'
				,equals: ''
				,ip: ''
				,credit_card: 'Please enter a valid credit card number.'
				,alpha: ''
				,alpha_numeric: ''
				,alpha_dash: ''
				,digit: 'Please enter only digits.'
				,numeric: 'Please enter a valid number.'
				,range: 'Please enter a value between {min} and {max}.'
				,decimal: 'Please enter a decimal number.'
				,color: ''
				,matches: ''
			}

			/**
			 * finds the most specific error message string and replaces any "{value}" substring with the actual value
			 */
			,format: function(field_name, rule, params) {
				var message;
				if (typeof this.options.messages[field_name] !== 'undefined' && typeof this.options.messages[field_name][rule] !== 'undefined') {
					message = this.options.messages[field_name][rule];
				} else {
					message = this.errors[rule];
				}

				if ($.type(params) !== 'undefined') {
					if ($.type(params) === 'boolean' || $.type(params) === 'string' || $.type(params) === 'number') {
						params = {value: params};
					}
					$.each(params, function(k, v) {
						message = message.replace(new RegExp('\\{'+k+'\\}', 'ig'), v);
					});
				}
				return message;
			}
		}
	});




	$.fn.scovalid = function ( options ) {
		var $this = this.eq(0)
			,validator = $this.data('scovalid');
		if (!validator) {
			validator = new $.scovalid($this, options);
			$this.data("scovalid", validator);
		}

		return validator.validate();
	}

}(window.jQuery);
