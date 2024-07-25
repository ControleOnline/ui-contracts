/**
 * Contract class.
 */

export default class Contract {
  constructor(id) {
    this.id        = id;
    this.original  = null;
    this.amended   = null;
    this.template  = null;
    this.status    = null;
    this.startDate = null;
    this.endDate   = null;
  }

  hasOriginal() {
    return this.original !== null;
  }

  hasAmended() {
    return this.amended !== null;
  }

  canEdit() {
    return this.status === 'Draft';
  }

  canSign() {
    return this.status !== 'Waiting signatures';
  }

  
}
