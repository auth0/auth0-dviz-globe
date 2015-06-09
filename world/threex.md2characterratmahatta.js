var THREEx	= THREEx || {}

/**
 * widely inspired from MD2Character.js from alteredq / http://alteredqualia.com/
 *
 * @name THREEx.MD2Character
 * @class
*/
THREEx.MD2CharacterRatmahatta	= function(onLoad, meshBody){
	// update function
	var onRenderFcts= [];
	this.update	= function(delta, now){
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(delta, now)
		})
	}

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	var character	= new THREEx.MD2Character(meshBody)
	this.character	= character
	onRenderFcts.push(function(delta){
		character.update(delta)
	})

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////
	// load the data
	// - TODO make all this data cachable, thus 2 instances load only once
	// - take a microcache.js and put it in THREEx.MD2Character
	character.load({
		baseUrl	: THREEx.MD2CharacterRatmahatta.baseUrl+'ratamahatta/',
		body	: "ratamahatta.js",
		skins	: [ "ratamahatta.png"]
	})
	character.addEventListener('loaded', function(){
		onLoad && onLoad(this)
	}.bind(this))

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	var skinIndexes	= {
		ratamahatta	: 0,
		ctf_b		: 1,
		ctf_r		: 2,
		dead		: 3,
		gearwhore	: 4,
	}
	this.skinNames	= Object.keys(skinIndexes)
	this.setSkinName= function(skinName){
		console.assert(skinIndexes[skinName] !== undefined)
		character.setSkin(skinIndexes[skinName])
	}

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////

	// obtained from Object.keys(character.meshBody.geometry.animations) AFTER loading
	var animationNames	= ["stand", "run", "attack", "pain", "jump", "flip", "salute", "taunt", "wave", "point", "crstand", "crwalk", "crattack", "crpain", "crdeath", "death"]
	this.animationNames	= animationNames
	this.setAnimationName	= function(animationName){
		console.assert(animationNames.indexOf(animationName) !== -1)
		character.setAnimation(animationName)
	}
}

THREEx.MD2CharacterRatmahatta.baseUrl	= ''

