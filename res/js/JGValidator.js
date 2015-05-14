var JGValidator = function( $elements, isLive, feedback_success, feedback_error ){
	
	var thisObj = this;
	
	var animatedEff = 'flash';
	var nodeOfErrorListElement = ".validator-error-list";
	
	var listFieldErrors    = "<ul class='fieldErrors'></ul>";
	
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
	
	thisObj.input_event    = "blur";
	thisObj.textarea_event = "blur";
	thisObj.select_event   = "change blur";
	thisObj.eventForClear  = "focus";
	
	this.setInput_event = function( event ){
		thisObj.input_event = event;
	};
	
	this.setTextarea_event = function( event ){
		thisObj.textarea_event = event;
	};
	
	this.setSelect_event = function( event ){
		thisObj.select_event = event;
	};
	
	this.setEventForClear = function( event ){
		thisObj.eventForClear = event;
	};
	
	/**
	 * Metodo che ricarica i nuovi elementi da validare
	 */
	this.replaceWith = function( $newElements ){
		$elements.off("change input blur");
		$elements = $newElements;
		thisObj.loadAllEventHand();
	};
	
	this.validate = function( $this ){
		var isValid = true;
		$this.closest(".jgvalid-input-group").find(".fieldErrors").remove();							// rimuovo la lista errori se già esistesse
		var errors = "";																	// variabile dove raccolgo gli errori riscontrati
		var value = $this.val();
		
		// Controllo gli errori
		/*
		 * campo richiesto
		 */
		if( typeof( $this.attr( required ) )!=="undefined" ){
			if( ""==value.trim() ){
				isValid = false;
				errors += thisObj.getFieldError( $this, required_message );
			}
		}
		
		/*
		 * regex
		 */
		var inputTxtRegex = $this.attr( regex_regex );
		if( typeof( inputTxtRegex )!=="undefined" ){
			var regex = new RegExp( inputTxtRegex );
			if( !regex.test( value ) ){
				isValid = false;
				errors += thisObj.getFieldError( $this, regex_message );
			}
		}
		
		/*
		 * lunghezza minima
		 */
		var attrMin_length = $this.attr( min_length );
		if( typeof( attrMin_length )!=="undefined" ){
			var nMin_length = parseInt( attrMin_length );
			if( nMin_length > value.length ){
				isValid = false;
				errors += thisObj.getFieldError( $this, min_length_message );
			}
		}
		
		/*
		 * lunghezza massima
		 */
		var attrMax_length = $this.attr( max_length );
		if( typeof( attrMax_length )!=="undefined" ){
			var nMax_length = parseInt( attrMax_length );
			if( nMax_length < value.length ){
				isValid = false;
				errors += thisObj.getFieldError( $this, max_length_message );
			}
		}
		
		/*
		 * Funzione custom da eseguire
		 */
		var attrEx_function = $this.attr( ex_function );
		
		if( typeof( attrEx_function )!=="undefined" ){
			if( !window[attrEx_function]( $this, thisObj ) ){
				isValid = false;
				errors += thisObj.getFieldError( $this, ex_function_message );
			}
		}
		
		if( !isValid ){
			/*
			 * Se è settato il div dove immettere gli errori lo uso
			 */
			var $putHereErrors = $this.closest(".jgvalid-input-group").find( nodeOfErrorListElement );
			
			if( 0>=$putHereErrors.length ){
				/*
				 * altrimenti li appendo dopo l'emento input
				 */
				$putHereErrors = $this.closest("div");
			}
			$putHereErrors.append( listFieldErrors );										// appendo la lista
			$putHereErrors.children(".fieldErrors").append( errors );						// appendo i messaggi con gli errori raccolti
			$this.closest(".jgvalid-input-group").addClass(feedback_error).removeClass(feedback_success);	// input successo
		}else{
			$this.closest(".jgvalid-input-group").removeClass(feedback_error).addClass(feedback_success);	// input errore
		}
		
		return isValid;
		
	};
	
	this.getFieldError = function( $this, nameOfError ){
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
	this.isValidForm = function(){
		var isValid = true;
		$elements.each(function(){
			var $this = $( this );
			if( !thisObj.validate( $this ) ){
				isValid = false;
				// Using animate.css library this snippets provides an animation
				// for all elements that aren't valid and have the class "animated"
				$this.addClass( animatedEff )
					 .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){ 
																											$this.removeClass( animatedEff )
																										  });
			}
		});
		return isValid;
	};
	
	this.showTheseErrorsOnElem = function( nameOfErrorsList, elemFilter ){
		var $elem = $elements.filter( elemFilter );
		$elem.closest(".jgvalid-input-group").find(".fieldErrors").remove();							// elimino l'eventuale lista aperta.
		var errors = "";
		
		$.each( nameOfErrorsList, function( index, value ){
			errors += thisObj.getFieldError( $elem, value );
		});
		
		if( ""!=errors ){
			// Se è settato il div dove immettere gli errori lo uso.
			var $putHereErrors = $elem.closest(".jgvalid-input-group").find( nodeOfErrorListElement );
			if( 0>=$putHereErrors.length ){
				// altrimenti li appendo dopo l'emento input.
				$putHereErrors = $elem.closest("div");
			}
			$putHereErrors.append( listFieldErrors );										// appendo la lista
			$putHereErrors.children(".fieldErrors").append( errors );						// appendo i messaggi con gli errori raccolti
		}
		$elem.closest(".jgvalid-input-group").addClass(feedback_error).removeClass(feedback_success);
	};
	
	this.showSuccessOnElem = function( elemFilter ){
		var $elem = $elements.filter( elemFilter );
		$elem.closest(".jgvalid-input-group").find(".fieldErrors").remove();							// elimino l'eventuale lista aperta.
		$elem.closest(".jgvalid-input-group").removeClass(feedback_error).addClass(feedback_success);
	};
	
	this.hideAllFeedbackToElement = function( elemFilter ){
		var $elem = $elements.filter( elemFilter );
		$elem.closest(".jgvalid-input-group").find(".fieldErrors").remove();							// elimino l'eventuale lista aperta.
		$elem.closest(".jgvalid-input-group").removeClass( feedback_error ).removeClass( feedback_success );
	};
	
	this.hideAllFeedback = function(){
		$elements.each(function(){
			var $formGroup = $(this).parent();//.closest(".jgvalid-input-group");
			$formGroup.removeClass(feedback_error).removeClass(feedback_success);
			$formGroup.find(".fieldErrors").remove();
		});
	};
	
	/**
	 * Se impostato su live la verifica del contenuto degli elementi viene fato immediatamente 
	 */
	this.loadAllEventHand = function(){
		if( isLive ){																		// se live appendo per ogni elemento un controllo che valida l'elemento
			$elements.each(function(){
				
				var $this = $( this );
				var event = "";
				
				if( $this.is("input") ){
					event = thisObj.input_event;
				}else
				if( $this.is("select") ){
					event = thisObj.select_event;
				}else
				if( $this.is("textarea") ){
					event = thisObj.textarea_event;
				}
				
				/**
				 * Script usato per validare gli elementi al
				 * verificardi di ben precisi eventi
				 */
				$this.on( event, function() {
					thisObj.validate( $( this ) );
				});
				
				/**
				 * Questo script pulisce l'elemento quando si verifica l'evento contenuto in "eventForClear"
				 * 
				 * Di default è impostato con focus, cioè quando un utente entra nel
				 * campo tutti i messaggi vengono nascosti cosi da non confondere l'utente
				 */
				$this.on( thisObj.eventForClear, function() {
					thisObj.hideAllFeedbackToElement( $( this ) );
				});
				
			});
			
		}
		
	};
	thisObj.loadAllEventHand();
};