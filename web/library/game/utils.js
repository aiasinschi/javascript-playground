var PairSet = PairSet || {
    elem: [],

    create: function(elems){
        var obj = Object.create(PairSet);
        obj.elem = [];
        for (var i = 0; i < elems.length; i++){
             obj.elem.push(elems[i]);
        }
        return obj;
    },

    contains: function(a){
        for (var i = 0; i < this.elem.length; i++){
            if ((a[0] === this.elem[i][0]) &&
                (a[1] === this.elem[i][1]) ){
                return true;
            }
        }
        return false;
    },

    add: function(e){
        if (this.contains(e)){
            return;
        }
        this.elem.push(e);
    }
};
