(ns bunsen.publications.route)

(def routes
  {"/publications/v1" {"/status" :status
                       "/publications" {"" :publications
                                        "_count" :publications-count
                                        ["/" :id] {"" :publication
                                                   "/ratings" :ratings
                                                   "/rating" :rating}}
                       "/categories" {"" :categories
                                      ["/" :id] :category}
                       "/seed" :seed}})