/** Weaving metamodel, in the same multi-level notation as the models it weaves. */
export const WEAVING_METAMODEL_YAML = `
# Weaving metamodel, in the same multi-level notation as the models it weaves.
#
# A weaving model (WModel) holds links (WLink) whose ends (WLinkEnd) are
# element references. Every link class declares the direction of the relation:
#   peer      the ends sit at the same level (between DTs, or between versions)
#   vertical  the ends sit at different levels of the same DT
#   any       the link states its own direction
level: O2
ePackage: weaving
eClasses:
  WLinkEnd: {}

  Expectation:
    eAttributes:
      typeVersion: EString
      eType: EString
      unit: EString
      meaning: EString
      accuracy: EDouble

  Timeliness:
    eAttributes:
      maxAge: EInt
      syncTolerance: EInt

  InterimBehaviour:
    eAttributes:
      element: EString
      behaviour: EString

  # What an initiating DT expects from a participating DT.
  Correspondence:
    direction: peer
    eAttributes:
      mapping: EString
      status: EString
      changeRequest: EString
    eReferences:
      initiating: { eType: WLinkEnd, lowerBound: 1 }
      participating: { eType: WLinkEnd }
      expects: { eType: Expectation, containment: true }
      timeliness: { eType: Timeliness, containment: true }
      interim: { eType: InterimBehaviour, containment: true, upperBound: -1 }

  # An entity in the model of a DT, and the DT that is the twin of that entity:
  # how a DT states that it is made of what other DTs represent.
  Representation:
    direction: peer
    eReferences:
      entity: { eType: WLinkEnd, lowerBound: 1 }
      dt: { eType: WLinkEnd, lowerBound: 1 }

  # A type version, or one of its elements, and its successor.
  Evolution:
    direction: peer
    eReferences:
      from: { eType: WLinkEnd, lowerBound: 1 }
      to: { eType: WLinkEnd, lowerBound: 1 }

  # Inconsistency across levels of the same DT.
  VerticalDrift:
    direction: vertical
    eAttributes:
      origin: EString # bottom-up | top-down
      dt: EString
      reasons: { eType: EString, upperBound: -1 }
    eReferences:
      upper: { eType: WLinkEnd, lowerBound: 1 }
      lower: { eType: WLinkEnd, lowerBound: 1 }

  # A correspondence between DTs that no longer holds.
  HorizontalDrift:
    direction: peer
    eAttributes:
      status: EString # broken | missing | ambiguous
      correspondence: EString
      reasons: { eType: EString, upperBound: -1 }
    eReferences:
      initiating: { eType: WLinkEnd, lowerBound: 1 }
      participating: { eType: WLinkEnd }

  # A drifted element and an element it affects.
  ImpactLink:
    direction: any
    eAttributes:
      direction: EString # peer | vertical
      scope: EString # intra-dt | inter-dt
      category: EString # conformance | correspondence | dependency | left-behind
      severity: EString # high | medium | low
      via: EString
      reason: EString
      interim: EString
    eReferences:
      source: { eType: WLinkEnd, lowerBound: 1 }
      target: { eType: WLinkEnd, lowerBound: 1 }
`;
