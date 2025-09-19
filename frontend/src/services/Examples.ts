export function getExample(exampleId: number|null): any|null {
    switch (exampleId) {
        case null:
            return null;
        case 0:
            return {inputSegments: ["Where ", "does ", "the ", "only ", "cranial ", "nerve ", "without ", "a ", "thalamic ", "relay ", "nucleus ", "enter ", "the skull", "?"], 
                template: "Below is a medical question and multiple options for the answer. Please answer the question by indicating the letter A, B, C, etc. that corresponds to the correct answer and only that letter. If you cannot answer the question give an empty response. Do not try to randomly guess the answer.\nQuestion:\n{input}\nPossible answers:\nA: Foramen rotundum\nB: Jugular foramen\nC: Internal auditory meatus\nD: Superior orbital fissure\nE: Cribriform plate",
                target: "e", 
                operator:"CONTAIN",
                predefinedEditHierarchy: {
                    "nodeId": "-1",
                    "parent": null,
                    "children": [
                        {
                            "nodeId": "0",
                            "parent": null,
                            "children": [
                                {
                                    "nodeId": "1",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        0
                                    ]
                                },
                                {
                                    "nodeId": "2",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        3
                                    ]
                                },
                                {
                                    "nodeId": "3",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        4
                                    ]
                                },
                                {
                                    "nodeId": "4",
                                    "parent": null,
                                    "children": [
                                        {
                                            "nodeId": "5",
                                            "parent": null,
                                            "children": [],
                                            "textIds": [
                                                8
                                            ]
                                        }
                                    ],
                                    "textIds": [
                                        6,
                                        7,
                                        9,
                                        10
                                    ]
                                }
                            ],
                            "textIds": [
                                1,
                                2,
                                5,
                                11,
                                12,
                                13
                            ]
                        }
                    ],
                    "textIds": []
                    
                 }
                }
        case 1:
            return { inputSegments: ["An ", "endocervical ", "swab ", "is performed ", "and ", "nucleic ", "acid ", "amplification ", "testing ", "via ", "polymerase chain reaction ", "is conducted", ". ", "It is ", "positive ", "for ", "Chlamydia trachomatis ", "and ", "negative ", "for ", "Neisseria gonorrhoeae", ". ", "Which ", "of ", "the following ", "is ", "the ", "most ", "appropriate ", "pharmacotherapy", "?"],
                template: "Below is a medical question and multiple options for the answer. Please answer the question by indicating the letter A, B, C, etc. that corresponds to the correct answer and only that letter. If you cannot answer the question give an empty response. Do not try to randomly guess the answer.\nQuestion:\n{input}\nPossible answers:\nA: Oral amoxicillin\nB: Intravenous cefoxitin plus oral doxycycline\nC: Intramuscular ceftriaxone\nD: Oral levofloxacin\nE: Intramuscular ceftriaxone plus oral azithromycin\nF: Oral azithromycin\nG: Oral doxycycline",
                target: "f", 
                operator: "CONTAIN",
                predefinedEditHierarchy: {
                    "nodeId": "-1",
                    "parent": null,
                    "children": [
                        {
                            "nodeId": "0",
                            "parent": null,
                            "children": [
                                {
                                    "nodeId": "1",
                                    "parent": null,
                                    "children": [
                                        {
                                            "nodeId": "2",
                                            "parent": null,
                                            "children": [],
                                            "textIds": [
                                                1
                                            ]
                                        }
                                    ],
                                    "textIds": [
                                        0,
                                        2,
                                        3
                                    ]
                                },
                                {
                                    "nodeId": "3",
                                    "parent": null,
                                    "children": [
                                        {
                                            "nodeId": "4",
                                            "parent": null,
                                            "children": [],
                                            "textIds": [
                                                5
                                            ]
                                        },
                                        {
                                            "nodeId": "5",
                                            "parent": null,
                                            "children": [],
                                            "textIds": [
                                                9,
                                                10
                                            ]
                                        }
                                    ],
                                    "textIds": [
                                        6,
                                        7,
                                        8,
                                        11
                                    ]
                                },
                                {
                                    "nodeId": "16",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        4
                                    ]
                                },
                                {
                                    "nodeId": "17",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        12
                                    ]
                                },
                                {
                                    "nodeId": "18",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        17
                                    ]
                                }
                            ],
                            "textIds": []
                        },
                        {
                            "nodeId": "6",
                            "parent": null,
                            "children": [
                                {
                                    "nodeId": "7",
                                    "parent": null,
                                    "children": [
                                        {
                                            "nodeId": "8",
                                            "parent": null,
                                            "children": [
                                                {
                                                    "nodeId": "9",
                                                    "parent": null,
                                                    "children": [],
                                                    "textIds": [
                                                        15,
                                                        16
                                                    ]
                                                }
                                            ],
                                            "textIds": [
                                                14
                                            ]
                                        },
                                        {
                                            "nodeId": "10",
                                            "parent": null,
                                            "children": [
                                                {
                                                    "nodeId": "11",
                                                    "parent": null,
                                                    "children": [],
                                                    "textIds": [
                                                        19,
                                                        20
                                                    ]
                                                }
                                            ],
                                            "textIds": [
                                                18
                                            ]
                                        }
                                    ],
                                    "textIds": []
                                }
                            ],
                            "textIds": [
                                13,
                                21
                            ]
                        },
                        {
                            "nodeId": "12",
                            "parent": null,
                            "children": [
                                {
                                    "nodeId": "13",
                                    "parent": null,
                                    "children": [],
                                    "textIds": [
                                        23,
                                        24
                                    ]
                                },
                                {
                                    "nodeId": "14",
                                    "parent": null,
                                    "children": [
                                        {
                                            "nodeId": "15",
                                            "parent": null,
                                            "children": [],
                                            "textIds": [
                                                27
                                            ]
                                        }
                                    ],
                                    "textIds": [
                                        28
                                    ]
                                }
                            ],
                            "textIds": [
                                22,
                                25,
                                26,
                                29,
                                30
                            ]
                        }
                    ],
                    "textIds": []
                }
             }
        
        default:
            throw new Error("Invalid example id");
    }
}

//options: ["A: Oral amoxicillin", "B: Intravenous cefoxitin plus oral doxycycline", "C: Intramuscular ceftriaxone", "D: Oral levofloxacin", "E: Intramuscular ceftriaxone plus oral azithromycin", "F: Oral azithromycin", "G: Oral doxycycline"], 
// case 2:
//             return { inputSegments: ["A ", "31-year", "-old ", "female ", "with ", "a ", "bacterial ", "infection ", "is prescribed ", "a drug ", "that binds ", "the dipeptide ", "D-Ala-D-Ala.", "Which ", "of ", "the ", "following ", "drugs ", "was ", "this patient ", "prescribed?"], options: ["A: Penicillin", "B: Chloramphenicol", "C: Nalidixic acid", "D: Vancomycin", "E: Polymyxin B"], target: "d", operator: 'CONTAIN'}
//         case 3:
//             return { inputSegments: ["An ", "important ", "step ", "in ", "the formation ", "of ", "thyroid hormones ", "is ", "the formation ", "of I2 ", "via ", "oxidation ", "of I-", ".", "Which ", "of ", "the ", "following ", "molecules ", "is ", "responsible ", "for ", "this reaction", "?"], options: ["A: Thyroid deiodinase", "B: Thyroid peroxidase", "C: 5'-deiodinase", "D: Perchlorate", "E: Propylthiouracil"] , target: "b", operator: "CONTAIN"}
//         case 4:
//             return []
