START TRANSACTION;

-- ============================================================
-- 1. PARTY TYPES - 30
-- ============================================================

INSERT INTO party_types
(
    partyTypeName,
    status,
    created_by,
    modified_by,
    created_at,
    updated_at
)
VALUES
('Customer', 'Active', NULL, NULL, NOW(), NOW()),
('Supplier', 'Active', NULL, NULL, NOW(), NOW()),
('Government', 'Active', NULL, NULL, NOW(), NOW()),
('Partner', 'Active', NULL, NULL, NOW(), NOW()),
('Service Provider', 'Active', NULL, NULL, NOW(), NOW()),
('Distributor', 'Active', NULL, NULL, NOW(), NOW()),
('Manufacturer', 'Active', NULL, NULL, NOW(), NOW()),
('Contractor', 'Active', NULL, NULL, NOW(), NOW()),
('Consultant', 'Active', NULL, NULL, NOW(), NOW()),
('Vendor', 'Active', NULL, NULL, NOW(), NOW()),
('Bank', 'Active', NULL, NULL, NOW(), NOW()),
('Insurance Company', 'Active', NULL, NULL, NOW(), NOW()),
('NGO', 'Active', NULL, NULL, NOW(), NOW()),
('Financial Institution', 'Active', NULL, NULL, NOW(), NOW()),
('Educational Institution', 'Active', NULL, NULL, NOW(), NOW()),
('Healthcare Provider', 'Active', NULL, NULL, NOW(), NOW()),
('Technology Partner', 'Active', NULL, NULL, NOW(), NOW()),
('Logistics Provider', 'Active', NULL, NULL, NOW(), NOW()),
('Legal Firm', 'Active', NULL, NULL, NOW(), NOW()),
('Real Estate Company', 'Active', NULL, NULL, NOW(), NOW()),
('Marketing Agency', 'Active', NULL, NULL, NOW(), NOW()),
('Telecommunication Provider', 'Active', NULL, NULL, NOW(), NOW()),
('Utility Provider', 'Active', NULL, NULL, NOW(), NOW()),
('Auditor', 'Active', NULL, NULL, NOW(), NOW()),
('Investor', 'Active', NULL, NULL, NOW(), NOW()),
('Shareholder', 'Active', NULL, NULL, NOW(), NOW()),
('Research Organization', 'Active', NULL, NULL, NOW(), NOW()),
('Development Organization', 'Active', NULL, NULL, NOW(), NOW()),
('International Organization', 'Active', NULL, NULL, NOW(), NOW()),
('Other Organization', 'Active', NULL, NULL, NOW(), NOW());


-- ============================================================
-- 2. DOCUMENT TYPES - 30
-- ============================================================

INSERT INTO document_type
(
    document_name,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
)
VALUES
('Contract', 'Active', NULL, NULL, NOW(), NOW()),
('Agreement', 'Active', NULL, NULL, NOW(), NOW()),
('Invoice', 'Active', NULL, NULL, NOW(), NOW()),
('License', 'Active', NULL, NULL, NOW(), NOW()),
('Purchase Order', 'Active', NULL, NULL, NOW(), NOW()),
('Service Agreement', 'Active', NULL, NULL, NOW(), NOW()),
('Employment Contract', 'Active', NULL, NULL, NOW(), NOW()),
('Lease Agreement', 'Active', NULL, NULL, NOW(), NOW()),
('Memorandum of Understanding', 'Active', NULL, NULL, NOW(), NOW()),
('Non Disclosure Agreement', 'Active', NULL, NULL, NOW(), NOW()),
('Work Order', 'Active', NULL, NULL, NOW(), NOW()),
('Quotation', 'Active', NULL, NULL, NOW(), NOW()),
('Proposal', 'Active', NULL, NULL, NOW(), NOW()),
('Tender Document', 'Active', NULL, NULL, NOW(), NOW()),
('Certificate', 'Active', NULL, NULL, NOW(), NOW()),
('Permit', 'Active', NULL, NULL, NOW(), NOW()),
('Policy Document', 'Active', NULL, NULL, NOW(), NOW()),
('Insurance Document', 'Active', NULL, NULL, NOW(), NOW()),
('Financial Statement', 'Active', NULL, NULL, NOW(), NOW()),
('Audit Report', 'Active', NULL, NULL, NOW(), NOW()),
('Project Report', 'Active', NULL, NULL, NOW(), NOW()),
('Technical Report', 'Active', NULL, NULL, NOW(), NOW()),
('Compliance Report', 'Active', NULL, NULL, NOW(), NOW()),
('Delivery Note', 'Active', NULL, NULL, NOW(), NOW()),
('Receipt', 'Active', NULL, NULL, NOW(), NOW()),
('Tax Document', 'Active', NULL, NULL, NOW(), NOW()),
('Warranty Document', 'Active', NULL, NULL, NOW(), NOW()),
('Registration Document', 'Active', NULL, NULL, NOW(), NOW()),
('Approval Letter', 'Active', NULL, NULL, NOW(), NOW()),
('Other Document', 'Active', NULL, NULL, NOW(), NOW());


-- ============================================================
-- 3. DATE TYPES - 30
-- ============================================================

INSERT INTO date_types
(
    dateTypeName,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
)
VALUES
('Expiry Date', 'Active', NULL, NULL, NOW(), NOW()),
('Renewal Date', 'Active', NULL, NULL, NOW(), NOW()),
('Review Date', 'Active', NULL, NULL, NOW(), NOW()),
('Payment Due Date', 'Active', NULL, NULL, NOW(), NOW()),
('Contract End Date', 'Active', NULL, NULL, NOW(), NOW()),
('Contract Start Date', 'Active', NULL, NULL, NOW(), NOW()),
('Agreement Date', 'Active', NULL, NULL, NOW(), NOW()),
('Effective Date', 'Active', NULL, NULL, NOW(), NOW()),
('Approval Date', 'Active', NULL, NULL, NOW(), NOW()),
('Submission Date', 'Active', NULL, NULL, NOW(), NOW()),
('Issue Date', 'Active', NULL, NULL, NOW(), NOW()),
('Delivery Date', 'Active', NULL, NULL, NOW(), NOW()),
('Completion Date', 'Active', NULL, NULL, NOW(), NOW()),
('Inspection Date', 'Active', NULL, NULL, NOW(), NOW()),
('Audit Date', 'Active', NULL, NULL, NOW(), NOW()),
('Renewal Notice Date', 'Active', NULL, NULL, NOW(), NOW()),
('Warranty Expiry Date', 'Active', NULL, NULL, NOW(), NOW()),
('License Expiry Date', 'Active', NULL, NULL, NOW(), NOW()),
('Permit Expiry Date', 'Active', NULL, NULL, NOW(), NOW()),
('Invoice Date', 'Active', NULL, NULL, NOW(), NOW()),
('Invoice Due Date', 'Active', NULL, NULL, NOW(), NOW()),
('Purchase Date', 'Active', NULL, NULL, NOW(), NOW()),
('Service Start Date', 'Active', NULL, NULL, NOW(), NOW()),
('Service End Date', 'Active', NULL, NULL, NOW(), NOW()),
('Project Start Date', 'Active', NULL, NULL, NOW(), NOW()),
('Project End Date', 'Active', NULL, NULL, NOW(), NOW()),
('Reporting Date', 'Active', NULL, NULL, NOW(), NOW()),
('Compliance Date', 'Active', NULL, NULL, NOW(), NOW()),
('Termination Date', 'Active', NULL, NULL, NOW(), NOW()),
('Final Review Date', 'Active', NULL, NULL, NOW(), NOW());


-- ============================================================
-- 4. PARTY MASTER - 60
-- ============================================================

INSERT INTO party_master
(
    partyName,
    address,
    partyTypeId,
    contactPerson,
    phone,
    email,
    created_by,
    updated_by,
    created_at,
    updated_at
)
SELECT
    CONCAT(
        'Company ',
        n
    ),

    CONCAT(
        CASE MOD(n - 1, 10)
            WHEN 0 THEN 'Motijheel'
            WHEN 1 THEN 'Gulshan'
            WHEN 2 THEN 'Banani'
            WHEN 3 THEN 'Uttara'
            WHEN 4 THEN 'Dhanmondi'
            WHEN 5 THEN 'Tejgaon'
            WHEN 6 THEN 'Mirpur'
            WHEN 7 THEN 'Mohakhali'
            WHEN 8 THEN 'Agargaon'
            ELSE 'Kawran Bazar'
        END,
        ', Dhaka, Bangladesh'
    ),

    pt.partyTypeId,

    CASE MOD(n - 1, 8)
        WHEN 0 THEN 'Rahim Ahmed'
        WHEN 1 THEN 'Karim Hasan'
        WHEN 2 THEN 'Sabbir Rahman'
        WHEN 3 THEN 'Nayeem Islam'
        WHEN 4 THEN 'Tanvir Ahmed'
        WHEN 5 THEN 'Fahim Chowdhury'
        WHEN 6 THEN 'Jahid Hasan'
        ELSE 'Imran Hossain'
    END,

    CONCAT(
        '017',
        LPAD(1000000 + n, 8, '0')
    ),

    CONCAT(
        'party',
        n,
        '@example.com'
    ),

    NULL,
    NULL,
    NOW(),
    NOW()

FROM
(
    SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL
    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL
    SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL
    SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL
    SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30 UNION ALL
    SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL
    SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36 UNION ALL
    SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL
    SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL
    SELECT 43 UNION ALL SELECT 44 UNION ALL SELECT 45 UNION ALL
    SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL
    SELECT 49 UNION ALL SELECT 50 UNION ALL SELECT 51 UNION ALL
    SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL
    SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL
    SELECT 58 UNION ALL SELECT 59 UNION ALL SELECT 60
) AS nums

JOIN party_types pt
    ON pt.partyTypeId =
       (
           SELECT partyTypeId
           FROM party_types
           ORDER BY partyTypeId
           LIMIT 1
       );


-- ============================================================
-- IMPORTANT:
-- The above JOIN would assign the same party type.
-- Update the 60 parties so all 30 party types are distributed.
-- ============================================================

UPDATE party_master p
JOIN
(
    SELECT
        partyId,
        ROW_NUMBER() OVER (ORDER BY partyId) AS rn
    FROM party_master
    WHERE partyName LIKE 'Company %'
) x
    ON x.partyId = p.partyId
JOIN
(
    SELECT
        partyTypeId,
        ROW_NUMBER() OVER (ORDER BY partyTypeId) AS rn
    FROM party_types
) t
    ON t.rn = MOD(x.rn - 1, 30) + 1
SET p.partyTypeId = t.partyTypeId;


-- ============================================================
-- 5. DOCUMENT MASTER - 60
-- ============================================================

INSERT INTO document_master
(
    title,
    description,
    partyName,
    docType,
    date,
    soft_copy,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
)
SELECT
    CONCAT('Document Record ', n),

    CONCAT(
        'Dummy document record number ',
        n,
        ' for testing relational document management.'
    ),

    p.partyId,

    dt.document_id,

    DATE_ADD(
        '2026-01-01',
        INTERVAL ((n - 1) * 5) DAY
    ),

    CONCAT(
        'documents/document-',
        n,
        '.pdf'
    ),

    'Active',
    NULL,
    NULL,
    NOW(),
    NOW()

FROM
(
    SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL
    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL
    SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL
    SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL
    SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30 UNION ALL
    SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL
    SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36 UNION ALL
    SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL
    SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL
    SELECT 43 UNION ALL SELECT 44 UNION ALL SELECT 45 UNION ALL
    SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL
    SELECT 49 UNION ALL SELECT 50 UNION ALL SELECT 51 UNION ALL
    SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL
    SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL
    SELECT 58 UNION ALL SELECT 59 UNION ALL SELECT 60
) nums

JOIN
(
    SELECT
        partyId,
        ROW_NUMBER() OVER (ORDER BY partyId) AS rn
    FROM party_master
    WHERE partyName LIKE 'Company %'
) p
    ON p.rn = nums.n

JOIN
(
    SELECT
        document_id,
        ROW_NUMBER() OVER (ORDER BY document_id) AS rn
    FROM document_type
) dt
    ON dt.rn = MOD(nums.n - 1, 30) + 1;


-- ============================================================
-- 6. DATE DETAILS - 60
-- ============================================================

INSERT INTO date_details
(
    dateTypeId,
    docId,
    date_value,
    notify_email,
    notify_sms,
    notification_before_days,
    notification_after_days,
    before_sent_at,
    after_sent_at,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
)
SELECT
    dt.dateTypeId,

    d.docId,

    DATE_ADD(
        '2026-09-01',
        INTERVAL ((x.rn - 1) * 7) DAY
    ),

    CASE
        WHEN MOD(x.rn, 3) = 0 THEN 0
        ELSE 1
    END,

    CASE
        WHEN MOD(x.rn, 2) = 0 THEN 0
        ELSE 1
    END,

    CASE MOD(x.rn, 6)
        WHEN 0 THEN 60
        WHEN 1 THEN 30
        WHEN 2 THEN 15
        WHEN 3 THEN 7
        WHEN 4 THEN 3
        ELSE 1
    END,

    CASE MOD(x.rn, 5)
        WHEN 0 THEN 30
        WHEN 1 THEN 15
        WHEN 2 THEN 7
        WHEN 3 THEN 3
        ELSE 1
    END,

    NULL,
    NULL,
    'Active',
    NULL,
    NULL,
    NOW(),
    NOW()

FROM
(
    SELECT
        docId,
        ROW_NUMBER() OVER (ORDER BY docId) AS rn
    FROM document_master
    WHERE title LIKE 'Document Record %'
) d

JOIN
(
    SELECT
        docId,
        ROW_NUMBER() OVER (ORDER BY docId) AS rn
    FROM document_master
    WHERE title LIKE 'Document Record %'
) x
    ON x.docId = d.docId

JOIN
(
    SELECT
        dateTypeId,
        ROW_NUMBER() OVER (ORDER BY dateTypeId) AS rn
    FROM date_types
) dt
    ON dt.rn = MOD(x.rn - 1, 30) + 1;


-- ============================================================
-- 7. ATTACHMENT MASTER - 60
-- ============================================================

INSERT INTO attachment_master
(
    docId,
    file_name,
    file_path,
    file_type,
    file_size,
    created_by,
    updated_by,
    created_at,
    updated_at
)
SELECT
    d.docId,

    CONCAT(
        'document-',
        x.rn,
        '-attachment.pdf'
    ),

    CONCAT(
        'attachments/',
        d.docId,
        '/document-',
        x.rn,
        '-attachment.pdf'
    ),

    'application/pdf',

    150000 + (x.rn * 5000),

    NULL,
    NULL,
    NOW(),
    NOW()

FROM
(
    SELECT
        docId,
        ROW_NUMBER() OVER (ORDER BY docId) AS rn
    FROM document_master
    WHERE title LIKE 'Document Record %'
) d

JOIN
(
    SELECT
        docId,
        ROW_NUMBER() OVER (ORDER BY docId) AS rn
    FROM document_master
    WHERE title LIKE 'Document Record %'
) x
    ON x.docId = d.docId;


COMMIT;