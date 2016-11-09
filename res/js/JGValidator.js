/**
 * Version 1.3.1
 * @param $elements
 * @param isLive
 * @constructor
 *
 * @Author Andrea Catania
 */
var JGValidator = function( $elements, isLive ){

    var self = this;

    var animatedEff = 'animated flash';
    var nodeOfErrorListElement = ".validator-error-list";

    var regex_regex        = "data-validator-regex-regex";
    var regex_message      = "data-validator-regex-message";

    var required           = "data-validator-required";
    var required_message   = "data-validator-required-message";

    var min_length         = "data-validator-min-length";
    var min_length_message = "data-validator-min-length-message";

    var max_length         = "data-validator-max-length";
    var max_length_message = "data-validator-max-length-message";

    var ex_function         = "data-validator-function";
    var ex_function_message = "data-validator-function-message";

    var   feedback_success = 'has-success'
        , feedback_warning = 'has-warning'
        , feedback_error = 'has-error';

    var firstInvalidElement = null;

    self.input_event    = "blur";
    self.textarea_event = "blur";
    self.select_event   = "change blur";
    self.eventForClear  = "focus";

    self.setInput_event = function( event ){
        self.input_event = event;
    };

    self.setTextarea_event = function( event ){
        self.textarea_event = event;
    };

    self.setSelect_event = function( event ){
        self.select_event = event;
    };

    self.setEventForClear = function( event ){
        self.eventForClear = event;
    };

    /**
     * Metodo che ricarica i nuovi elementi da validare
     */
    self.replaceWith = function( $newElements ){
        $elements.off("change input blur");
        $elements = $newElements;
        self.loadAllEventHand();
    };

    self.getMessageAsListItem = function( $this, nameOfError ){
        var errorMessage = $this.attr( nameOfError );
        if( typeof( errorMessage )==="undefined" ){
            return "";
        }else{
            return "<li>" + errorMessage + "</li>";
        }
    };

    /**
     * Checks if all fields are valid.
     *
     * @return true if all elements are valid otherwise false.
     */
    self.validate = function(animate){
        var isValid = true;
        firstInvalidElement = null;
        $elements.each(function(){
            var $this = $( this );
            if( !validateElem( $this ) ){

                if(null==firstInvalidElement)
                    firstInvalidElement = $this;

                isValid = false;
                if( typeof animate !== 'undefined' && animate )
                    self.animate($this);
            }
        });
        return isValid;
    };

    self.getFirstInvalidElement = function(){
        return firstInvalidElement;
    };

    self.showTheseErrorsOnElem = function( errorsName, elemFilter ){
        var $elem = $elements.filter( elemFilter );
        showTheseErrorsOnElem( errorsName, $elem);
    };

    self.showTheseWarningsOnElem = function( errorsName, elemFilter ){
        var $elem = $elements.filter( elemFilter );
        showTheseWarningsOnElem( errorsName, $elem);
    };

    self.showSuccessOnElem = function( elemFilter ){
        showSuccessOnElem( $elements.filter( elemFilter ) );
    };

    self.hideAllFeedback = function(){
        $elements.each(function(){
            hideAllFeedbackToElement( $(this) );
        });
    };

    self.hideAllFeedbackToElement = function( elemFilter ){
        hideAllFeedbackToElement( $elements.filter( elemFilter ) );
    };

    /**
     * If the element isn't animable (not have animated class) set true to add this class.
     * @param $elem
     */
    self.animate = function( $elem ){
        // Using animate.css library this snippets provides an animation
        // for all elements that aren't valid and have the class "animated"
        $elem.addClass( animatedEff )
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $elem.removeClass( animatedEff )
            });
    };

    /**
     * Se impostato su live la verifica del contenuto degli elementi viene fato immediatamente
     */
    self.loadAllEventHand = function(){
        if( isLive ){                                                                        // se live appendo per ogni elemento un controllo che valida l'elemento
            $elements.each(function(){

                var $this = $( this );
                var event = "";

                if( $this.is("input") ){
                    event = self.input_event;
                }else
                if( $this.is("select") ){
                    event = self.select_event;
                }else
                if( $this.is("textarea") ){
                    event = self.textarea_event;
                }

                /**
                 * Script usato per validare gli elementi al
                 * verificardi di ben precisi eventi
                 */
                $this.on( event, function() {
                    validateElem( $( this ) );
                });

                /**
                 * Questo script pulisce l'elemento quando si verifica l'evento contenuto in "eventForClear"
                 *
                 * Di default è impostato con focus, cioè quando un utente entra nel
                 * campo tutti i messaggi vengono nascosti cosi da non confondere l'utente
                 */
                $this.on( self.eventForClear, function() {
                    self.hideAllFeedbackToElement( $( this ) );
                });

            });

        }

    };

    var validateElem = function( $this ){
        var   isValid = true
            , errors = []
            , value = $this.val();
                
        if(null!=value){
            value = $.trim(value);
        }

        // Error checking
        if( typeof( $this.attr( required ) )!=="undefined" ){
            if( null==value || ""==value ){
                isValid = false;
                errors.push(required_message);
            }
        }

        // Regex processed only if the value isn't void
        if( null!=value && ""!=value ){
            var inputTxtRegex = $this.attr( regex_regex );
            if( typeof( inputTxtRegex )!=="undefined" ){
                var regex = new RegExp( inputTxtRegex );
                if( !regex.test( value ) ){
                    isValid = false;
                    errors.push(regex_message);
                }
            }
        }

        var attrMin_length = $this.attr( min_length );
        if( typeof( attrMin_length )!=="undefined" ){
            var nMin_length = parseInt( attrMin_length );
            if( nMin_length > value.length ){
                isValid = false;
                errors.push(min_length_message);
            }
        }

        var attrMax_length = $this.attr( max_length );
        if( typeof( attrMax_length )!=="undefined" ){
            var nMax_length = parseInt( attrMax_length );
            if( nMax_length < value.length ){
                isValid = false;
                errors.push(max_length_message);
            }
        }

        var attrEx_function = $this.attr( ex_function );
        if( typeof( attrEx_function )!=="undefined" ){
            if( !window[attrEx_function]( $this, self ) ){
                isValid = false;
                errors.push(ex_function_message);
            }
        }

        if( !isValid ){
            showTheseErrorsOnElem(errors, $this);
        }else{
            self.showSuccessOnElem($this);
        }

        return isValid;
    };

    var showTheseErrorsOnElem = function( errorsName, $elem ){

        var $jgvalidInputGroup = $elem.closest(".jgvalid-input-group");
        $jgvalidInputGroup.find(".fieldErrors").remove();

        var errorLItems = getMessageListItems($elem, errorsName);

        if( ''!=errorLItems ){
            setMessageListItems($elem, $jgvalidInputGroup, errorLItems);
        }

        $jgvalidInputGroup.addClass(feedback_error).removeClass(feedback_success + " " + feedback_warning);
    };

    var showTheseWarningsOnElem = function( errorsName, $elem ){

        var $jgvalidInputGroup = $elem.closest(".jgvalid-input-group");
        $jgvalidInputGroup.find(".fieldErrors").remove();

        var errorLItems = getMessageListItems($elem, errorsName);

        if( ''!=errorLItems ){
            setMessageListItems($elem, $jgvalidInputGroup, errorLItems);
        }
        $jgvalidInputGroup.addClass(feedback_warning).removeClass(feedback_success + " " + feedback_error);
    };
    var showSuccessOnElem = function( $elem ){
        var $jgvalidInputGroup = $elem.closest(".jgvalid-input-group");
        $jgvalidInputGroup.find(".fieldErrors").remove();
        $jgvalidInputGroup.addClass(feedback_success).removeClass(feedback_warning + " " + feedback_error);
    };

    var getMessageListItems = function( $elem, errorsName ){
        var errorLItems = '';
        $.each( errorsName, function( index, value ){
            errorLItems += self.getMessageAsListItem( $elem, value );
        });
        return errorLItems;
    };

    var setMessageListItems = function( $elem, $jgvalidInputGroup, errorLItems ){
        var $putHereErrors = $jgvalidInputGroup.find( nodeOfErrorListElement );
        if( 0>=$putHereErrors.length ){
            $putHereErrors = $elem.closest("div");
        }
        $putHereErrors.append("<ul class='fieldErrors'>"+errorLItems+"</ul>");
    };

    var hideAllFeedbackToElement = function( $elem ){
        var $jgvalidInputGroup = $elem.closest(".jgvalid-input-group");
        $jgvalidInputGroup.removeClass( feedback_error + " " + feedback_success + " " + feedback_warning );
        $jgvalidInputGroup.find(".fieldErrors").remove();
    };

    self.loadAllEventHand();
};
