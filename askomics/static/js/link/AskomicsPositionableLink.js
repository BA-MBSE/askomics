/*jshint esversion: 6 */

class AskomicsPositionableLink extends AskomicsLink {

  constructor(link,sourceN,targetN) {
    super(link,sourceN,targetN);

    this.type     = 'included' ;
    this.label    = 'included in';
    this.same_tax  =  true ;
    this.same_ref  =  true ;
    this.strict   =  true ;
  }
  setjson(obj) {
    super.setjson(obj);
    this.type     = obj.type ;
    this.label    = obj.label;
    this.same_tax  =  obj.same_tax ;
    this.same_ref  =  obj.same_ref ;
    this.strict   =  obj.strict ;
  }
  getPanelView() {
    return new AskomicsPositionableLinkView(this);
  }

  getFillColor() { return 'darkgreen'; }

  buildConstraintsSPARQL() {

    let node = this.target ;
    let secondNode = this.source ;
    let blockConstraint = [];
    /* constrainte to target the same ref/taxon */

    blockConstraint.push("?"+'URI'+node.SPARQLid+" "+ ":position_taxon"+" "+ "?taxon_"+node.SPARQLid);
    blockConstraint.push("?"+'URI'+node.SPARQLid+" "+ ":position_ref"+" "+ "?ref_"+node.SPARQLid);

    blockConstraint.push("?"+'URI'+secondNode.SPARQLid+" "+ ":position_taxon"+" "+ "?taxon_"+secondNode.SPARQLid);
    blockConstraint.push("?"+'URI'+secondNode.SPARQLid+" "+ ":position_ref"+" "+ "?ref_"+secondNode.SPARQLid);

    /* manage start and end variates */
    blockConstraint.push("?"+'URI'+node.SPARQLid+" "+ ":position_start"+" "+ "?start_"+node.SPARQLid);
    blockConstraint.push("?"+'URI'+node.SPARQLid+" "+ ":position_end"+" "+ "?end_"+node.SPARQLid);

    blockConstraint.push("?"+'URI'+secondNode.SPARQLid+" "+ ":position_start"+" "+ "?start_"+secondNode.SPARQLid);
    blockConstraint.push("?"+'URI'+secondNode.SPARQLid+" "+ ":position_end"+" "+ "?end_"+secondNode.SPARQLid);

    this.buildFiltersSPARQL(blockConstraint);
    return [blockConstraint,''];
  }

  buildFiltersSPARQL(filters) {
    let equalsign = '';
    let ua = userAbstraction;

    if (!this.strict) {
      equalsign = '=';
    }

    let node = this.target ;
    let secondNode = this.source ;
    let info = ua.getPositionableEntities();


    if (this.same_ref) {
      //TODO: test which of the following line is the fastest
      filters.push('FILTER(?ref_'+node.SPARQLid+' = ?ref_'+secondNode.SPARQLid+')');
      //filters.push('FILTER(SAMETERM(?ref_'+node.SPARQLid+', ?ref_'+secondNode.SPARQLid+'))');
    }

    if (this.same_tax) {
      //TODO: test which of the following line is the fastest
      filters.push('FILTER(?taxon_'+node.SPARQLid+' = ?taxon_'+secondNode.SPARQLid+')');
      //filters.push('FILTER(SAMETERM(?taxon_'+node.SPARQLid+', ?taxon_'+secondNode.SPARQLid+'))');
    }


    switch(this.type) {
      case 'included' :
          filters.push('FILTER((?start_'+secondNode.SPARQLid+' >'+equalsign+' ?start_'+node.SPARQLid+' ) && (?end_'+secondNode.SPARQLid+' <'+equalsign+' ?end_'+node.SPARQLid+'))');
          break;
      case 'excluded':
          filters.push('FILTER(?end_'+node.SPARQLid+' <'+equalsign+' ?start_'+secondNode.SPARQLid+' || ?start_'+node.SPARQLid+' >'+equalsign+' ?end_'+secondNode.SPARQLid+')');
          break;

      case 'overlap':
          filters.push('FILTER(((?end_'+secondNode.SPARQLid+' >'+equalsign+' ?start_'+node.SPARQLid+') && (?start_'+secondNode.SPARQLid+' <'+equalsign+' ?end_'+node.SPARQLid+')) || ((?start_'+secondNode.SPARQLid+' <'+equalsign+' ?end_'+node.SPARQLid+') && (?end_'+secondNode.SPARQLid+' >'+equalsign+' ?start_'+node.SPARQLid+')))');
          break;

      case 'near':
        alert('sorry, near query is not implemanted yet !');
        hideModal();
        exit();
          break;

      default:
        throw new Error("buildPositionableConstraintsGraph: unkown type :"+JSON.stringify(type));
    }
  }

  instanciateVariateSPARQL(variates) {

  }


}