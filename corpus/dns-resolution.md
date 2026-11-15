# How DNS Resolution Works

The Domain Name System translates human-readable hostnames such as example.com into IP addresses that computers use to route traffic. Resolution usually begins in the operating system stub resolver, which checks a local cache and then forwards the query to a recursive resolver, often run by an internet service provider or a public DNS service.

When the recursive resolver does not have the answer cached, it walks the DNS hierarchy itself. It first asks a root name server, which does not know the final answer but returns a referral to the top-level domain servers for the suffix in question, such as .com. The resolver then asks a top-level domain server, which returns a referral to the authoritative name server for the specific domain. Finally the resolver asks that authoritative server, which holds the actual records, and returns the answer to the client.

Every DNS record carries a time to live, or TTL, measured in seconds. The TTL tells caches how long they may keep the record before asking again. A long TTL reduces query traffic and resolution latency but makes changes propagate slowly, while a short TTL makes failover faster at the cost of more queries. Operators often lower the TTL in advance of a planned migration and raise it again afterwards.

Several record types matter in daily work. An A record maps a name to an IPv4 address and an AAAA record maps it to an IPv6 address. A CNAME record makes one name an alias of another name, and the resolver follows the alias to its target. MX records name the mail servers for a domain, and TXT records carry arbitrary text, commonly used for domain ownership verification and mail authentication policies such as SPF.

Resolution failures have distinct shapes. NXDOMAIN means the queried name does not exist. SERVFAIL means the resolver could not get a usable answer, for example because DNSSEC validation failed. A timeout usually points at a network problem or an unresponsive server rather than a naming problem.
